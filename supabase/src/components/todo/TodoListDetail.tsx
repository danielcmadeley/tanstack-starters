import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
  CircularProgress,
  Alert,
  Chip,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Task as TaskIcon,
} from "@mui/icons-material";
import { useAuth } from "@/contexts/auth";
import { usePowerSync } from "@/components/providers/SystemProvider";
import { useQuery } from "@/hooks/usePowerSyncQuery";
import {
  LISTS_TABLE,
  TODOS_TABLE,
  ListRecord,
  TodoRecord,
} from "@/library/powersync/AppSchema";
import { useNavigate } from "@tanstack/react-router";

interface TodoListDetailProps {
  listId: string;
}

export const TodoListDetail: React.FC<TodoListDetailProps> = ({ listId }) => {
  const { user } = useAuth();
  const powerSync = usePowerSync();
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoRecord | null>(null);
  const [todoDescription, setTodoDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch list details
  const { data: listData, isLoading: listLoading } = useQuery<ListRecord>(
    `SELECT * FROM ${LISTS_TABLE} WHERE id = ?`,
    [listId],
  );

  // Fetch todos for this list
  const { data: todos, isLoading: todosLoading } = useQuery<TodoRecord>(
    `SELECT * FROM ${TODOS_TABLE} WHERE list_id = ? ORDER BY created_at DESC`,
    [listId],
  );

  const list = listData?.[0];

  const handleCreateTodo = async () => {
    if (!todoDescription.trim() || !user || !powerSync) return;

    setIsLoading(true);
    setError(null);

    try {
      const todoId = crypto.randomUUID();
      await powerSync.execute(
        `
        INSERT INTO ${TODOS_TABLE} (id, list_id, description, completed, created_at, created_by)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
        [
          todoId,
          listId,
          todoDescription.trim(),
          0,
          new Date().toISOString(),
          user.id,
        ],
      );

      setTodoDescription("");
      setIsCreateDialogOpen(false);
    } catch (err) {
      setError("Failed to create todo. Please try again.");
      console.error("Error creating todo:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTodo = async () => {
    if (!todoDescription.trim() || !editingTodo || !powerSync) return;

    setIsLoading(true);
    setError(null);

    try {
      await powerSync.execute(
        `
        UPDATE ${TODOS_TABLE}
        SET description = ?
        WHERE id = ?
      `,
        [todoDescription.trim(), editingTodo.id],
      );

      setTodoDescription("");
      setEditingTodo(null);
      setIsEditDialogOpen(false);
    } catch (err) {
      setError("Failed to update todo. Please try again.");
      console.error("Error updating todo:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTodo = async (todo: TodoRecord) => {
    if (!powerSync || !user) return;

    setIsLoading(true);
    setError(null);

    try {
      const isCompleted = todo.completed === 1;
      await powerSync.execute(
        `
        UPDATE ${TODOS_TABLE}
        SET completed = ?, completed_at = ?, completed_by = ?
        WHERE id = ?
      `,
        [
          isCompleted ? 0 : 1,
          isCompleted ? null : new Date().toISOString(),
          isCompleted ? null : user.id,
          todo.id,
        ],
      );
    } catch (err) {
      setError("Failed to update todo. Please try again.");
      console.error("Error toggling todo:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    if (!powerSync) return;

    if (!confirm("Are you sure you want to delete this todo?")) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await powerSync.execute(
        `
        DELETE FROM ${TODOS_TABLE} WHERE id = ?
      `,
        [todoId],
      );
    } catch (err) {
      setError("Failed to delete todo. Please try again.");
      console.error("Error deleting todo:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateDialog = () => {
    setTodoDescription("");
    setError(null);
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (todo: TodoRecord) => {
    setTodoDescription(todo.description || "");
    setEditingTodo(todo);
    setError(null);
    setIsEditDialogOpen(true);
  };

  const closeDialogs = () => {
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setEditingTodo(null);
    setTodoDescription("");
    setError(null);
  };

  const goBack = () => {
    navigate({ to: "/" });
  };

  const completedTodos = todos?.filter((todo) => todo.completed === 1) || [];
  const incompleteTodos = todos?.filter((todo) => todo.completed === 0) || [];

  if (listLoading || todosLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!list) {
    return (
      <Box>
        <Alert severity="error">
          List not found or you don't have permission to access it.
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={goBack} sx={{ mt: 2 }}>
          Back to Lists
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={goBack} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          {list.name}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateDialog}
          disabled={isLoading}
        >
          Add Todo
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box display="flex" gap={2} mb={3}>
        <Chip
          label={`${todos?.length || 0} total tasks`}
          color="primary"
          variant="outlined"
        />
        <Chip
          label={`${completedTodos.length} completed`}
          color="success"
          variant="outlined"
        />
        <Chip
          label={`${incompleteTodos.length} remaining`}
          color="warning"
          variant="outlined"
        />
      </Box>

      {!todos || todos.length === 0 ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <TaskIcon sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No todos yet
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Add your first todo to get started!
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openCreateDialog}
              >
                Add Your First Todo
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Box>
          {/* Active Todos */}
          {incompleteTodos.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  To Do ({incompleteTodos.length})
                </Typography>
                <List>
                  {incompleteTodos.map((todo, index) => (
                    <React.Fragment key={todo.id}>
                      <ListItem>
                        <Checkbox
                          edge="start"
                          checked={false}
                          onChange={() => handleToggleTodo(todo)}
                          disabled={isLoading}
                        />
                        <ListItemText
                          primary={todo.description}
                          secondary={`Created ${new Date(todo.created_at || "").toLocaleDateString()}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => openEditDialog(todo)}
                            disabled={isLoading}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            onClick={() => handleDeleteTodo(todo.id)}
                            disabled={isLoading}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < incompleteTodos.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}

          {/* Completed Todos */}
          {completedTodos.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Completed ({completedTodos.length})
                </Typography>
                <List>
                  {completedTodos.map((todo, index) => (
                    <React.Fragment key={todo.id}>
                      <ListItem>
                        <Checkbox
                          edge="start"
                          checked={true}
                          onChange={() => handleToggleTodo(todo)}
                          disabled={isLoading}
                        />
                        <ListItemText
                          primary={
                            <Typography
                              sx={{
                                textDecoration: "line-through",
                                color: "text.secondary",
                              }}
                            >
                              {todo.description}
                            </Typography>
                          }
                          secondary={`Completed ${new Date(todo.completed_at || todo.created_at || "").toLocaleDateString()}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => openEditDialog(todo)}
                            disabled={isLoading}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            onClick={() => handleDeleteTodo(todo.id)}
                            disabled={isLoading}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < completedTodos.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </Box>
      )}

      {/* Create Todo Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onClose={closeDialogs}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Todo</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Todo Description"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={todoDescription}
            onChange={(e) => setTodoDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialogs} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateTodo}
            variant="contained"
            disabled={!todoDescription.trim() || isLoading}
          >
            {isLoading ? <CircularProgress size={20} /> : "Add Todo"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Todo Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onClose={closeDialogs}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Todo</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Todo Description"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={todoDescription}
            onChange={(e) => setTodoDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialogs} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleEditTodo}
            variant="contained"
            disabled={!todoDescription.trim() || isLoading}
          >
            {isLoading ? <CircularProgress size={20} /> : "Update Todo"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
