import EditPlan from "@/components/planner/edit-plan";

interface EditPlanPageProps {
  params: {
    id: string;
  };
}

export default function EditPlanPage({ params }: EditPlanPageProps) {
  return <EditPlan planId={params.id} />;
}
