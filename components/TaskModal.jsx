// components/TaskModal.jsx
"use client";

import { useState, useEffect } from "react";
import { Plus, Minus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSelector } from 'react-redux';

export default function TaskModal({ 
  show, 
  onClose, 
  onSubmit, 
  onDelete, 
  editMode = false 
}) {
  const currentTask = useSelector((state) => state.tasks.currentTask);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("todo");
  const [subtasks, setSubtasks] = useState([""]);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  useEffect(() => {
    if (show) {
      if (currentTask && Object.keys(currentTask).length > 0) {
        setTitle(currentTask.title || "");
        setDescription(currentTask.description || "");
        setCategory(currentTask.category || "todo");
        const taskSubtasks = currentTask.subtasks && currentTask.subtasks.length > 0 
          ? [...currentTask.subtasks] 
          : [""];
        setSubtasks(taskSubtasks);
      } else {
        setTitle("");
        setDescription("");
        setCategory("todo");
        setSubtasks([""]);
      }
    }
  }, [show, currentTask]);

  const handleSubtaskChange = (index, value) => {
    const updatedSubtasks = [...subtasks];
    updatedSubtasks[index] = value;
    setSubtasks(updatedSubtasks);
  };

  const addSubtask = () => {
    setSubtasks([...subtasks, ""]);
  };

  const removeSubtask = (index) => {
    const updatedSubtasks = subtasks.filter((_, i) => i !== index);
    setSubtasks(updatedSubtasks.length ? updatedSubtasks : [""]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const filteredSubtasks = subtasks.filter(task => task.trim() !== "");
    
    const taskData = {
      id: currentTask?.id || Date.now().toString(),
      title,
      description,
      category,
      subtasks: filteredSubtasks,
    };
    
    onSubmit(taskData);
  };

  const handleDeleteConfirm = () => {
    if (onDelete && currentTask?.id) {
      onDelete(currentTask.id);
    }
    setShowDeleteAlert(false);
  };

  return (
    <>
      <Dialog open={show} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editMode ? "Edit Task" : "Add New Task"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Task title"
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Task description"
                  rows={3}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="category">Status</Label>
                <Select 
                  value={category} 
                  onValueChange={setCategory}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="doing">Doing</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label>Subtasks</Label>
                {subtasks.map((subtask, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={subtask}
                      onChange={(e) => handleSubtaskChange(index, e.target.value)}
                      placeholder="Subtask"
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeSubtask(index)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={addSubtask}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Subtask
                </Button>
              </div>
            </div>
            <DialogFooter className="flex sm:justify-between">
              {editMode && onDelete && (
                <Button 
                  type="button" 
                  variant="destructive"
                  onClick={() => setShowDeleteAlert(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </Button>
              )}
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editMode ? "Save Changes" : "Create Task"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}