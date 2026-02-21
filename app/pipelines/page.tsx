import Header from "@/components/layout/Header";
import PipelineCard from "@/components/dashboard/PipelineCard";
import { mockPipelines } from "@/lib/mock-data";

export default function PipelinesPage() {
  return (
    <>
      <Header
        title="Pipelines"
        subtitle={`${mockPipelines.length} pipelines total`}
      />
      <main className="flex-1 px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {mockPipelines.map((pipeline) => (
            <PipelineCard key={pipeline.id} pipeline={pipeline} />
          ))}
        </div>
      </main>
    </>
  );
}
