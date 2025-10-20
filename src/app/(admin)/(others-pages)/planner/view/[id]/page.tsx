import ViewPlan from "@/components/planner/view-plan";

interface ViewPlanPageProps {
  params: {
    id: string;
  };
}

export default function ViewPlanPage({ params }: ViewPlanPageProps) {
  return <ViewPlan planId={params.id} />;
}
