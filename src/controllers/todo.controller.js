import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Todo } from "../models/todo.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

//get todo
const getTodos = asyncHandler(async (req, res) => {
  const _id = req.params._id;

  const todo = await Todo.find({ createdBy: _id });
  // const todo = await Todo.find({
  //   $or: [{ createdBy: _id }, { todos }],
  // });

  if (!todo) {
    res.json({ status: 404, message: "Todos not found" });
  }

  return res.status(200).json({
    status: 200,
    todo,
    message: "fetched todos Successfully",
    todo: todo,
  });
});

//post todo
const postTodos = asyncHandler(async (req, res) => {
  const { title, desc, done, createdBy } = req.body;
  // console.log(req.user);
  if (!(title, desc)) throw new ApiError(404, "Error while posting todo");

  // const isVerifiedUser = req.user._id === Todo._id;

  // if (!isVerifiedUser) {
  //   throw new ApiError(401, "You are not authorized to post todos");
  // }

  const todo = await Todo.create({ title, desc, done, createdBy });
  // console.log(todo);

  const createdTodo = await Todo.findById(todo._id);
  if (!createdTodo) {
    throw new ApiError(500, "Something went wrong while posting the todo");
  }

  await User.findOneAndUpdate(
    { _id: req.user._id },
    { $push: { todos: createdTodo } }
  );

  res
    .status(200)
    .json(new ApiResponse(200, createdTodo, "posted todo Successfully"));
});

//delete todo
const deleteTodos = asyncHandler(async (req, res) => {
  const { todoId } = req.body;
  if (!todoId)
    return res
      .status(404)
      .send({ success: false, message: "Error while fetching todo" });

  const todo = await Todo.findOne({ _id:todoId });
  const deletedTodo = await Todo.findByIdAndDelete(todo._id);
  if (!deletedTodo) {
    return res
      .status(500)
      .send({
        success: false,
        message: "Something went wrong while deleting the todo",
      });
  }

  res
    .status(200)
    .send({ success: true, deletedTodo, message: "todo deleted Successfully" });
});

//update todo
const updateTodos = asyncHandler(async (req, res) => {
  const { todoId, createdBy, title, desc, done } = req.body;
  if (!todoId)
    return res
      .status(402)
      .send({ success: false, message: "Error while fetching Todo" });

  // const todo = await Todo.findOne({ todoId, createdBy });
  const todo = await Todo.findOne({ _id: todoId });
  console.log("Todo", todo);
  if (!todo)
    return res
      .status(404)
      .send({ success: false, message: "There is no todo" });

  const updatedTodo = await Todo.findByIdAndUpdate(
    todo._id,
    {
      title,
      desc,
      done,
    },
    { new: true }
  );
  if (!updatedTodo) {
    return res.status(500).send({
      success: false,
      message: "Something went wrong while updating the todo",
    });
  }

  res.status(200).send({
    success: false,
    updatedTodo,
    message: "todo updated Successfully",
  });
});

export { getTodos, postTodos, deleteTodos, updateTodos };
