import * as adminSchemas from "./schemas/Admin";
import * as phdSchemas from "./schemas/Phd";
import { modules } from "./schemas/Form";

// Example library code that is common to both the client and server
export function libTest(name: string): string {
    return `Hello from library to ${name}`;
}

export { adminSchemas, modules, phdSchemas };
