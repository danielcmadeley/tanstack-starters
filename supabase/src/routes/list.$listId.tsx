import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { TodoListDetail } from "@/components/todo/TodoListDetail";

type ListParams = {
  listId: string;
};

export const Route = createFileRoute("/list/$listId")({
  component: ListDetailPage,
});

function ListDetailPage() {
  const { listId } = Route.useParams();

  return (
    <AuthGuard requireAuth={true}>
      <TodoListDetail listId={listId} />
    </AuthGuard>
  );
}
