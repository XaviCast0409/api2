import { Router } from "express";
const router = Router();

router.get("/", (req, res) => {
  res.send("back deploy railway");
});


export default router;