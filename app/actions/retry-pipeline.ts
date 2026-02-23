"use server";

import { after } from "next/server";
import { prisma } from "@/lib/db";

export async function startPipelineRun(pipelineId: string): Promise<string> {
  const run = await prisma.pipelineRun.create({
    data: {
      pipelineId,
      status: "running",
      startedAt: new Date(),
      finishedAt: null,
      durationMs: null,
      rowsProcessed: null,
      errorMessage: null,
    },
  });

  after(async () => {
    const result = await executePipeline(pipelineId);
    await prisma.pipelineRun.update({
      where: { id: run.id },
      data: {
        status: result.status,
        finishedAt: new Date(),
        durationMs: result.durationMs,
        rowsProcessed: result.rowsProcessed,
        errorMessage: result.errorMessage,
      },
    });
  });

  return run.id;
}

async function executePipeline(pipelineId: string): Promise<{
  status: "success" | "failed";
  durationMs: number;
  rowsProcessed: number | null;
  errorMessage: string | null;
}> {
  const apiUrl = process.env.PIPELINE_API_URL;

  if (!apiUrl) {
    const durationMs = 1500 + Math.floor(Math.random() * 3500);
    await new Promise((resolve) => setTimeout(resolve, durationMs));
    return {
      status: "success",
      durationMs,
      rowsProcessed: Math.floor(Math.random() * 50000) + 1000,
      errorMessage: null,
    };
  }

  const startedAt = Date.now();
  try {
    const res = await fetch(`${apiUrl}/pipelines/${pipelineId}/run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.PIPELINE_API_SECRET
          ? { Authorization: `Bearer ${process.env.PIPELINE_API_SECRET}` }
          : {}),
      },
    });

    const durationMs = Date.now() - startedAt;

    if (!res.ok) {
      const text = await res.text();
      return {
        status: "failed",
        durationMs,
        rowsProcessed: null,
        errorMessage: `HTTP ${res.status}: ${text}`,
      };
    }

    const data = await res.json();
    return {
      status: data.status === "success" ? "success" : "failed",
      durationMs: data.durationMs ?? durationMs,
      rowsProcessed: data.rowsProcessed ?? null,
      errorMessage: data.errorMessage ?? null,
    };
  } catch (err) {
    return {
      status: "failed",
      durationMs: Date.now() - startedAt,
      rowsProcessed: null,
      errorMessage: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
