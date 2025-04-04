// store/taskSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tasks: {
    todo: [],
    doing: [],
    done: []
  },
  currentTask: null,
  isEditMode: false,
  showTaskModal: false
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask: (state, action) => {
      const { task } = action.payload;
      state.tasks[task.category].push(task);
    },
    updateTask: (state, action) => {
      const { updatedTask } = action.payload;
      // Remove from all categories
      Object.keys(state.tasks).forEach(category => {
        state.tasks[category] = state.tasks[category].filter(task => task.id !== updatedTask.id);
      });
      // Add to the correct category
      state.tasks[updatedTask.category].push(updatedTask);
    },
    deleteTask: (state, action) => {
      const { taskId } = action.payload;
      Object.keys(state.tasks).forEach(category => {
        state.tasks[category] = state.tasks[category].filter(task => task.id !== taskId);
      });
    },
    setCurrentTask: (state, action) => {
      state.currentTask = action.payload;
    },
    setIsEditMode: (state, action) => {
      state.isEditMode = action.payload;
    },
    setShowTaskModal: (state, action) => {
      state.showTaskModal = action.payload;
    },
    moveTask: (state, action) => {
      const { taskId, sourceColumn, targetColumn } = action.payload;
      // Find the task
      let task = null;
      for (const column of Object.keys(state.tasks)) {
        const found = state.tasks[column].find(t => t.id === taskId);
        if (found) {
          task = { ...found };
          break;
        }
      }
      
      if (task) {
        // Remove from source column
        state.tasks[sourceColumn] = state.tasks[sourceColumn].filter(t => t.id !== taskId);
        // Update category and add to target column
        const updatedTask = { ...task, category: targetColumn };
        state.tasks[targetColumn].push(updatedTask);
      }
    }
  }
});

export const { 
  addTask, 
  updateTask, 
  deleteTask, 
  setCurrentTask, 
  setIsEditMode, 
  setShowTaskModal,
  moveTask
} = taskSlice.actions;

export default taskSlice.reducer;