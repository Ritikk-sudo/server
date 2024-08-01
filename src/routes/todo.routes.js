import { Router } from "express";
import { getTodos, updateTodos } from "../controllers/todo.controller.js";
import { postTodos } from "../controllers/todo.controller.js";
import { deleteTodos } from "../controllers/todo.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.route("/getTodos/:_id").get(getTodos);
// router.route("/getTodos").get(verifyJWT, getTodos);
router.route("/postTodos").post(verifyJWT, postTodos);
router.route("/deleteTodos").delete( deleteTodos);
router.route("/updateTodos").put( updateTodos);

export default router;
