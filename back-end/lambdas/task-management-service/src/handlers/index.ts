import { loginHandler}   from "./login";
import * as userHandler   from "./userHandler";
import * as consultationTypeHandler  from "./consultationTypeHandler";
import * as taskHandler  from "./taskHandler";
import * as financeHandler  from "./financeHandler";
import * as doctorCompetencyHandler  from "./doctorCompetencyHandler";
import * as doctorHandler  from "./doctorHandler";

export const handlers = {
    loginHandler,
    userHandler,
    consultationTypeHandler,
    taskHandler,
    financeHandler,
    doctorCompetencyHandler,
    doctorHandler
};
