import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import produitsRouter from "./produits";
import catalogueRouter from "./catalogue";
import panierRouter from "./panier";
import commandesRouter from "./commandes";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(produitsRouter);
router.use(catalogueRouter);
router.use(panierRouter);
router.use(commandesRouter);
router.use(adminRouter);

export default router;
