// components/Dashboard.jsx
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import TaskModal from "@/components/TaskModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverlay 
} from "@dnd-kit/core";
import { 
  SortableContext, 
  sortableKeyboardCoordinates, 
  useSortable, 
  verticalListSortingStrategy 
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Task Card component that can be clicked but not sorted
const TaskCard = ({ task, onClick }) => {
  return (
    <Card 
      className="mb-3 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick(task)}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{task.title}</CardTitle>
        <CardDescription className="line-clamp-2">{task.description}</CardDescription>
      </CardHeader>
      {task.subtasks && task.subtasks.length > 0 && (
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {task.subtasks.map((subtask, i) => (
              <Badge key={i} variant="outline">{subtask}</Badge>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

// Sortable Task Card component
const SortableTaskCard = ({ task, onTaskClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className="mb-3"
    >
      <Card 
        className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
        onClick={(e) => {
          // Stop propagation to prevent drag handler conflicts
          e.stopPropagation();
          onTaskClick(task);
        }}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{task.title}</CardTitle>
          <CardDescription className="line-clamp-2">{task.description}</CardDescription>
        </CardHeader>
        {task.subtasks && task.subtasks.length > 0 && (
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {task.subtasks.map((subtask, i) => (
                <Badge key={i} variant="outline">{subtask}</Badge>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

// Column component
const TaskColumn = ({ id, title, color, tasks, onTaskClick }) => {
  return (
    <div className="flex flex-col h-full" data-column-id={id}>
      <div className={`p-3 rounded-t-lg ${color}`}>
        <h2 className="font-semibold">{title}</h2>
      </div>
      <div className="bg-muted/50 rounded-b-lg p-3 flex-1 min-h-96 max-h-[calc(100vh-200px)] overflow-y-auto">
        <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskCard 
              key={task.id} 
              task={task} 
              onTaskClick={onTaskClick}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeDragId, setActiveDragId] = useState(null);
  const [tasks, setTasks] = useState({
    todo: [],
    doing: [],
    done: []
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Increased activation delay to better distinguish between click and drag
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddTask = (task) => {
    setTasks((prevTasks) => ({
      ...prevTasks,
      [task.category]: [...prevTasks[task.category], task]
    }));
    closeTaskModal();
  };

  const handleUpdateTask = (updatedTask) => {
    setTasks((prevTasks) => {
      const newTasks = { ...prevTasks };
      
      // First, remove from all categories to handle category changes
      Object.keys(newTasks).forEach(category => {
        newTasks[category] = newTasks[category].filter(task => task.id !== updatedTask.id);
      });
      
      // Then add to the correct category
      newTasks[updatedTask.category] = [...newTasks[updatedTask.category], updatedTask];
      
      return newTasks;
    });
    
    closeTaskModal();
  };

  const handleDeleteTask = (taskId) => {
    setTasks((prevTasks) => {
      const newTasks = { ...prevTasks };
      
      // Remove from all categories
      Object.keys(newTasks).forEach(category => {
        newTasks[category] = newTasks[category].filter(task => task.id !== taskId);
      });
      
      return newTasks;
    });
    
    closeTaskModal();
  };

  const handleTaskClick = (task) => {
    // Since we're using both click and drag, we need to ensure
    // they don't conflict. The click should open the edit modal.
    setCurrentTask(task);
    setIsEditMode(true);
    setShowTaskModal(true);
  };

  const closeTaskModal = () => {
    setShowTaskModal(false);
    setCurrentTask(null);
    setIsEditMode(false);
  };

  const openAddTaskModal = () => {
    setCurrentTask(null);
    setIsEditMode(false);
    setShowTaskModal(true);
  };

  const handleDragStart = (event) => {
    setActiveDragId(event.active.id);
  };

  const handleDragEnd = (event) => {
    setActiveDragId(null);
    const { active, over } = event;
    
    if (!active || !over) return;
    
    // Find the task being dragged
    let draggedTask = null;
    let sourceColumn = null;
    
    // Find which column the dragged task is in
    for (const column of Object.keys(tasks)) {
      const task = tasks[column].find(t => t.id === active.id);
      if (task) {
        draggedTask = { ...task };
        sourceColumn = column;
        break;
      }
    }
    
    if (!draggedTask || !sourceColumn) return;
    
    // Find the column where the task was dropped
    const overElement = document.elementFromPoint(
      event.activatorEvent.clientX,
      event.activatorEvent.clientY
    );
    
    // Function to traverse up the DOM to find column ID
    const findColumnId = (element) => {
      let current = element;
      while (current) {
        if (current.dataset && current.dataset.columnId) {
          return current.dataset.columnId;
        }
        current = current.parentElement;
      }
      return null;
    };
    
    const targetColumn = findColumnId(overElement);
    
    // Only process if we found a valid target column and it's different from source
    if (targetColumn && targetColumn !== sourceColumn) {
      setTasks(prevTasks => {
        const newTasks = { ...prevTasks };
        
        // Remove from source column
        newTasks[sourceColumn] = newTasks[sourceColumn].filter(t => t.id !== draggedTask.id);
        
        // Update category property and add to target column
        const updatedTask = { ...draggedTask, category: targetColumn };
        newTasks[targetColumn] = [...newTasks[targetColumn], updatedTask];
        
        return newTasks;
      });
    }
  };

  const columns = [
    { id: "todo", title: "To Do", color: "bg-blue-100 dark:bg-blue-900" },
    { id: "doing", title: "Doing", color: "bg-amber-100 dark:bg-amber-900" },
    { id: "done", title: "Done", color: "bg-green-100 dark:bg-green-900" }
  ];

  // Find active task being dragged (for drag overlay)
  let activeTask = null;
  if (activeDragId) {
    for (const column of Object.keys(tasks)) {
      const found = tasks[column].find(task => task.id === activeDragId);
      if (found) {
        activeTask = found;
        break;
      }
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button onClick={openAddTaskModal} className="gap-2">
          <Plus className="h-4 w-4" /> Add Task
        </Button>
      </div>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((column) => (
            <TaskColumn 
              key={column.id}
              id={column.id}
              title={column.title}
              color={column.color}
              tasks={tasks[column.id]}
              onTaskClick={handleTaskClick}
            />
          ))}
        </div>
        
        {/* Drag overlay shows what's being dragged */}
        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} onClick={() => {}} /> : null}
        </DragOverlay>
      </DndContext>

      {/* Task Modal for both Add and Edit */}
      <TaskModal 
        show={showTaskModal} 
        onClose={closeTaskModal} 
        onSubmit={isEditMode ? handleUpdateTask : handleAddTask}
        onDelete={isEditMode ? handleDeleteTask : null}  
        initialData={currentTask}
        editMode={isEditMode}
      />
    </div>
  );
}