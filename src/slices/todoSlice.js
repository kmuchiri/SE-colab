import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  collection,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";

const initialValue = {
  filterStatus: "all",
  todoList: [],
};

const todosCollectionPath = "todo";

const getTodosCollection = async (user) => {
  try {
    if (user) {
      const userDocRef = doc(db, "Users", user.uid);
      const todosCollection = collection(userDocRef, todosCollectionPath);
      return todosCollection;
    } else {
      console.log("No user");
      return null;
    }
  } catch (error) {
    console.error("Error getting todos collection:", error);
    throw error;
  }
};

const fetchTodosAsync = createAsyncThunk("todo/fetchTodos", async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    // const todosCollection = getTodosCollection(user);
    if (user) {
      const todosCollectionRef = await getTodosCollection(user);
      if (todosCollectionRef) {
        const querySnapshot = await getDocs(todosCollectionRef);
        console.log("Query snapshot:", querySnapshot);
        const todos = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Fetched todos:", todos);
        return todos;
      } else {
        console.log("No todos collection");
        return [];
      }
    } else {
      console.log("No user");
      return [];
    }
  } catch (error) {
    console.error("Error fetching todos:", error);
    throw error;
  }
});

const addTodoAsync = createAsyncThunk(
  "todo/addTodo",
  async (todo, thunkAPI) => {
    try {
      const newTodo = {
        ...todo,
        time: todo.time.toLocaleString(),
      };
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User is not authenticated");
      }
      const userDocRef = doc(db, "Users", user.uid);
      const todosCollection = collection(userDocRef, todosCollectionPath);
      const todosCollectionSnapshot = await getDocs(todosCollection);
      if (todosCollectionSnapshot.empty) {
        await setDoc(
          userDocRef,
          { [todosCollectionPath]: [] },
          { merge: true }
        );
      }

      const docRef = await addDoc(todosCollection, newTodo);
      return { id: docRef.id, ...newTodo };
    } catch (error) {
      console.error("Error adding todo:", error);
      throw error;
    }
  }
);

const updateTodoAsync = createAsyncThunk(
  "todo/updateTodo",
  async (updatedTodo, thunkAPI) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User is not authenticated");
      }
      const todosCollection = await getTodosCollection(user);
      if (!todosCollection) {
        console.log("No todos collection");
        return updatedTodo; // Return the original todo if no collection
      }
      console.log("Updating todo:", updatedTodo);
      const { id, ...updatedTodoData } = updatedTodo;
      console.log("Updated data:", updatedTodoData);
      const response = await updateDoc(
        doc(todosCollection, id),
        updatedTodoData
      );
      console.log("Update response:", response);

      return updatedTodo;
    } catch (error) {
      console.error("Error updating todo:", error);
      throw error;
    }
  }
);

const deleteTodoAsync = createAsyncThunk(
  "todo/deleteTodo",
  async (todoId, thunkAPI) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const todosCollection = await getTodosCollection(user);

      await deleteDoc(doc(todosCollection, todoId));
      return todoId;
    } catch (error) {
      console.error("Error deleting todo:", error);
      throw error;
    }
  }
);

const todoSlice = createSlice({
  name: "todo",
  initialState: initialValue,
  reducers: {
    updateFilterStatus: (state, action) => {
      state.filterStatus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addTodoAsync.fulfilled, (state, action) => {
        state.todoList.push(action.payload);
      })
      .addCase(updateTodoAsync.fulfilled, (state, action) => {
        const { id, ...updatedTodo } = action.payload;
        state.todoList = state.todoList.map((todo) =>
          todo.id === id ? { ...todo, ...updatedTodo } : todo
        );
      });
    builder.addCase(deleteTodoAsync.fulfilled, (state, action) => {
      const todoId = action.payload;
      state.todoList = state.todoList.filter((todo) => todo.id !== todoId);
    });
    builder.addCase(fetchTodosAsync.fulfilled, (state, action) => {
      state.todoList = action.payload;
    });
  },
});

export const { updateFilterStatus } = todoSlice.actions;
export { addTodoAsync, updateTodoAsync, deleteTodoAsync, fetchTodosAsync };
export default todoSlice.reducer;
