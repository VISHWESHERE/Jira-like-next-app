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
import { useSelector, useDispatch } from 'react-redux';
import { 
  addTask, 
  updateTask, 
  deleteTask, 
  setCurrentTask, 
  setIsEditMode, 
  setShowTaskModal,
  moveTask
} from '../store/taskSlice';

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
  const dispatch = useDispatch();
  const { tasks, currentTask, isEditMode, showTaskModal } = useSelector((state) => state.tasks);
  const [activeDragId, setActiveDragId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
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
    dispatch(addTask({ task }));
    closeTaskModal();
  };

  const handleUpdateTask = (updatedTask) => {
    dispatch(updateTask({ updatedTask }));
    closeTaskModal();
  };

  const handleDeleteTask = (taskId) => {
    dispatch(deleteTask({ taskId }));
    closeTaskModal();
  };

  const handleTaskClick = (task) => {
    dispatch(setCurrentTask(task));
    dispatch(setIsEditMode(true));
    dispatch(setShowTaskModal(true));
  };

  const closeTaskModal = () => {
    dispatch(setShowTaskModal(false));
    dispatch(setCurrentTask(null));
    dispatch(setIsEditMode(false));
  };

  const openAddTaskModal = () => {
    dispatch(setCurrentTask(null));
    dispatch(setIsEditMode(false));
    dispatch(setShowTaskModal(true));
  };

  const handleDragStart = (event) => {
    setActiveDragId(event.active.id);
  };

  const handleDragEnd = (event) => {
    setActiveDragId(null);
    const { active, over } = event;
    
    if (!active || !over) return;
    
    let sourceColumn = null;
    for (const column of Object.keys(tasks)) {
      const task = tasks[column].find(t => t.id === active.id);
      if (task) {
        sourceColumn = column;
        break;
      }
    }
    
    if (!sourceColumn) return;
    
    const overElement = document.elementFromPoint(
      event.activatorEvent.clientX,
      event.activatorEvent.clientY
    );
    
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
    
    if (targetColumn && targetColumn !== sourceColumn) {
      dispatch(moveTask({ 
        taskId: active.id, 
        sourceColumn, 
        targetColumn 
      }));
    }
  };

  const columns = [
    { id: "todo", title: "To Do", color: "bg-blue-100 dark:bg-blue-900" },
    { id: "doing", title: "Doing", color: "bg-amber-100 dark:bg-amber-900" },
    { id: "done", title: "Done", color: "bg-green-100 dark:bg-green-900" }
  ];

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
        
        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} onClick={() => {}} /> : null}
        </DragOverlay>
      </DndContext>

      <TaskModal 
        show={showTaskModal} 
        onClose={closeTaskModal} 
        onSubmit={isEditMode ? handleUpdateTask : handleAddTask}
        onDelete={isEditMode ? handleDeleteTask : null}  
        editMode={isEditMode}
      />
    </div>
  );
}