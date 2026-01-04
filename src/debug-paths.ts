import { BASE_DIR, PATHS } from "./constants";

console.log("OCM Environment Check:");
console.log("----------------------");
console.log(`Environment: ${process.env.OCM_ENV || "development (default)"}`);
console.log(`Base Directory: ${BASE_DIR}`);
console.log(`Config Path: ${PATHS.config}`);
console.log(`Skill Path: ${PATHS.skill}`);
console.log(`Agent Path: ${PATHS.agent}`);
console.log(`Command Path: ${PATHS.command}`);
console.log(`MCP Path: ${PATHS.mcp}`);
