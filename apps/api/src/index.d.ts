import { Hono } from 'hono';
declare const app: Hono<import("hono/types").BlankEnv, import("hono/types").BlankSchema, "/">;
declare const route: import("hono/hono-base").HonoBase<import("hono/types").BlankEnv, {
    "/": {
        $get: {
            input: {};
            output: {
                message: string;
            };
            outputFormat: "json";
            status: import("hono/utils/http-status").ContentfulStatusCode;
        };
    };
} & {
    "/hello": {
        $post: {
            input: {
                json: {
                    name: string;
                };
            };
            output: {
                message: string;
            };
            outputFormat: "json";
            status: import("hono/utils/http-status").ContentfulStatusCode;
        };
    };
}, "/", "/hello">;
export type AppType = typeof route;
export default app;
//# sourceMappingURL=index.d.ts.map