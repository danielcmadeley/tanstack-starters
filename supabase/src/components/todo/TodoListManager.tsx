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
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  List as ListIcon,
} from "@mui/icons-material";
import { useAuth } from "@/contexts/auth";
import { usePowerSync } from "@/components/providers/SystemProvider";
import { useQuery } from "@/hooks/usePowerSyncQuery";
import {
  LISTS_TABLE,
  TODOS_TABLE,
  ListRecord,
} from "@/library/powersync/AppSchema";
import { useNavigate } from "@tanstack/react-router";

export const TodoListManager: React.FC = () => {
  const { user } = useAuth();
  const powerSync = usePowerSync();
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingList, setEditingList] = useState<ListRecord | null>(null);
  const [listName, setListName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch lists with task counts
  const { data: lists, isLoading: listsLoading } = useQuery<
    ListRecord & { total_tasks: number; completed_tasks: number }
  >(
    `
    SELECT
      ${LISTS_TABLE}.*,
      COUNT(${TODOS_TABLE}.id) as total_tasks,
      SUM(CASE WHEN ${TODOS_TABLE}.completed = 1 THEN 1 ELSE 0 END) as completed_tasks
    FROM ${LISTS_TABLE}
    LEFT JOIN ${TODOS_TABLE} ON ${LISTS_TABLE}.id = ${TODOS_TABLE}.list_id
    WHERE ${LISTS_TABLE}.owner_id = ?
    GROUP BY ${LISTS_TABLE}.id
    ORDER BY ${LISTS_TABLE}.created_at DESC
  `,
    [user?.id],
  );

  const handleCreateList = async () => {
    if (!listName.trim() || !user || !powerSync) return;

    setIsLoading(true);
    setError(null);

    try {
      const listId = crypto.randomUUID();
      await powerSync.execute(
        `
        INSERT INTO ${LISTS_TABLE} (id, name, owner_id, created_at)
        VALUES (?, ?, ?, ?)
      `,
        [listId, listName.trim(), user.id, new Date().toISOString()],
      );

      setListName("");
      setIsCreateDialogOpen(false);
    } catch (err) {
      setError("Failed to create list. Please try again.");
      console.error("Error creating list:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditList = async () => {
    if (!listName.trim() || !editingList || !powerSync) return;

    setIsLoading(true);
    setError(null);

    try {
      await powerSync.execute(
        `
        UPDATE ${LISTS_TABLE}
        SET name = ?
        WHERE id = ?
      `,
        [listName.trim(), editingList.id],
      );

      setListName("");
      setEditingList(null);
      setIsEditDialogOpen(false);
    } catch (err) {
      setError("Failed to update list. Please try again.");
      console.error("Error updating list:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (!powerSync) return;

    if (
      !confirm("Are you sure you want to delete this list and all its tasks?")
    ) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Delete todos first
      await powerSync.execute(
        `
        DELETE FROM ${TODOS_TABLE} WHERE list_id = ?
      `,
        [listId],
      );

      // Delete the list
      await powerSync.execute(
        `
        DELETE FROM ${LISTS_TABLE} WHERE id = ?
      `,
        [listId],
      );
    } catch (err) {
      setError("Failed to delete list. Please try again.");
      console.error("Error deleting list:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateDialog = () => {
    setListName("");
    setError(null);
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (list: ListRecord) => {
    setListName(list.name || "");
    setEditingList(list);
    setError(null);
    setIsEditDialogOpen(true);
  };

  const closeDialogs = () => {
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setEditingList(null);
    setListName("");
    setError(null);
  };

  const navigateToList = (listId: string) => {
    navigate({ to: `/list/${listId}` });
  };

  if (listsLoading) {
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

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" component="h2">
          My Todo Lists
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateDialog}
          disabled={isLoading}
        >
          Create List
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {!lists || lists.length === 0 ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <ListIcon sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No lists yet
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Create your first todo list to get started!
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openCreateDialog}
              >
                Create Your First List
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <List>
          {lists.map((list) => (
            <Card key={list.id} sx={{ mb: 2 }}>
              <ListItem
                sx={{
                  cursor: "pointer",
                  "&:hover": { backgroundColor: "action.hover" },
                }}
                onClick={() => navigateToList(list.id)}
              >
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography variant="h6">{list.name}</Typography>
                      <Box display="flex" gap={1}>
                        <Chip
                          label={`${list.total_tasks || 0} tasks`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        {list.completed_tasks > 0 && (
                          <Chip
                            label={`${list.completed_tasks} completed`}
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      Created{" "}
                      {new Date(list.created_at || "").toLocaleDateString()}
                    </Typography>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditDialog(list);
                    }}
                    disabled={isLoading}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteList(list.id);
                    }}
                    disabled={isLoading}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            </Card>
          ))}
        </List>
      )}

      {/* Create List Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onClose={closeDialogs}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New List</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="List Name"
            fullWidth
            variant="outlined"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleCreateList();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialogs} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateList}
            variant="contained"
            disabled={!listName.trim() || isLoading}
          >
            {isLoading ? <CircularProgress size={20} /> : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit List Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onClose={closeDialogs}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit List</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="List Name"
            fullWidth
            variant="outlined"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleEditList();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialogs} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleEditList}
            variant="contained"
            disabled={!listName.trim() || isLoading}
          >
            {isLoading ? <CircularProgress size={20} /> : "Update"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
