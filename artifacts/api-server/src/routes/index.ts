import { Router, type IRouter } from "express";
import healthRouter from "./health";
import weatherRouter from "./weather";
import destinationsRouter from "./destinations";
import tripsRouter from "./trips";
import itineraryRouter from "./itinerary";
import packingRouter from "./packing";
import bookmarksRouter from "./bookmarks";
import notificationsRouter from "./notifications";
import analyticsRouter from "./analytics";
import aiRouter from "./ai";

const router: IRouter = Router();

router.use(healthRouter);
router.use(weatherRouter);
router.use(destinationsRouter);
router.use(tripsRouter);
router.use(itineraryRouter);
router.use(packingRouter);
router.use(bookmarksRouter);
router.use(notificationsRouter);
router.use(analyticsRouter);
router.use(aiRouter);

export default router;
