import EditPlan from "@/components/planner/edit-plan";

interface EditPlanPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPlanPage({ params }: EditPlanPageProps) {
  const { id } = await params;
  return <EditPlan planId={id} />;
}
