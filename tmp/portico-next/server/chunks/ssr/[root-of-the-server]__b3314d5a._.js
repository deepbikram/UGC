module.exports = [
"[next]/internal/font/google/geist_cfd9e230.module.css [app-rsc] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "className": "geist_cfd9e230-module__wMpiTW__className",
  "variable": "geist_cfd9e230-module__wMpiTW__variable",
});
}),
"[next]/internal/font/google/geist_cfd9e230.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$geist_cfd9e230$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__ = __turbopack_context__.i("[next]/internal/font/google/geist_cfd9e230.module.css [app-rsc] (css module)");
;
const fontData = {
    className: __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$geist_cfd9e230$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].className,
    style: {
        fontFamily: "'Geist', 'Geist Fallback'",
        fontStyle: "normal"
    }
};
if (__TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$geist_cfd9e230$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].variable != null) {
    fontData.variable = __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$geist_cfd9e230$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].variable;
}
const __TURBOPACK__default__export__ = fontData;
}),
"[next]/internal/font/google/geist_mono_3342dced.module.css [app-rsc] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "className": "geist_mono_3342dced-module__ksAy2q__className",
  "variable": "geist_mono_3342dced-module__ksAy2q__variable",
});
}),
"[next]/internal/font/google/geist_mono_3342dced.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$geist_mono_3342dced$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__ = __turbopack_context__.i("[next]/internal/font/google/geist_mono_3342dced.module.css [app-rsc] (css module)");
;
const fontData = {
    className: __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$geist_mono_3342dced$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].className,
    style: {
        fontFamily: "'Geist Mono', 'Geist Mono Fallback'",
        fontStyle: "normal"
    }
};
if (__TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$geist_mono_3342dced$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].variable != null) {
    fontData.variable = __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$geist_mono_3342dced$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].variable;
}
const __TURBOPACK__default__export__ = fontData;
}),
"[externals]/pg [external] (pg, esm_import)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("pg");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[project]/src/lib/db.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

// Portico talks to Supabase Postgres directly over the pooler using the
// `portico_app` role. Queries are still plain SQL; `?` placeholders are
// rewritten to `$1..$n` so call sites stay driver-agnostic.
__turbopack_context__.s([
    "all",
    ()=>all,
    "get",
    ()=>get,
    "getSetting",
    ()=>getSetting,
    "logActivity",
    ()=>logActivity,
    "run",
    ()=>run,
    "setSetting",
    ()=>setSetting
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/pg [external] (pg, esm_import)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
__TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__["types"].setTypeParser(20, (v)=>v === null ? null : Number(v));
__TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__["types"].setTypeParser(1184, (v)=>v === null ? null : new Date(v).toISOString());
__TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__["types"].setTypeParser(1114, (v)=>v === null ? null : new Date(`${v}Z`).toISOString());
__TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__["types"].setTypeParser(1082, (v)=>v);
const globalForDb = globalThis;
function pool() {
    if (!globalForDb.porticoPool) {
        globalForDb.porticoPool = new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__["Pool"]({
            connectionString: process.env.SUPABASE_DB_URL,
            ssl: {
                rejectUnauthorized: false
            },
            max: 5
        });
    }
    return globalForDb.porticoPool;
}
function toPg(sql) {
    let i = 0;
    return sql.replace(/\?/g, ()=>`$${++i}`).replace(/datetime\('now'\)/g, "now()");
}
async function get(sql, params = []) {
    const res = await pool().query(toPg(sql), params);
    return res.rows[0];
}
async function all(sql, params = []) {
    const res = await pool().query(toPg(sql), params);
    return res.rows;
}
async function run(sql, params = []) {
    const res = await pool().query(toPg(sql), params);
    return {
        rowCount: res.rowCount ?? 0,
        rows: res.rows
    };
}
async function getSetting(key) {
    const row = await get("SELECT value FROM settings WHERE key = ?", [
        key
    ]);
    return row?.value ?? "";
}
async function setSetting(key, value) {
    await run("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value", [
        key,
        value
    ]);
}
async function logActivity(entry) {
    await run("INSERT INTO activity (user_id, actor_name, actor_role, kind, summary) VALUES (?, ?, ?, ?, ?)", [
        entry.userId ?? null,
        entry.actorName,
        entry.actorRole,
        entry.kind,
        entry.summary
    ]);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/brand.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Band9Prep Creator Partnerships defaults. Everything here is overridable at
// runtime from Admin → Settings, so rebranding never needs a code change: the
// values below are only the fallbacks a fresh install starts with.
// ponytail: program settings are plain settings-table keys — no migration.
__turbopack_context__.s([
    "BRAND",
    ()=>BRAND,
    "SETTINGS_SCHEMA",
    ()=>SETTINGS_SCHEMA,
    "SETTING_DEFAULTS",
    ()=>SETTING_DEFAULTS
]);
const BRAND = {
    name: "Band9Prep Creator Partnerships",
    tagline: "Create authentic IELTS-prep videos. Get paid per eligible view.",
    description: "The Band9Prep creator portal: onboarding, guidelines, video submissions, and payouts in one calm place.",
    supportEmail: "hello@band9prep.com",
    site: "https://band9prep.com",
    /** Coal, ink, and one warm stone accent. */ colors: {
        coal: "#0b0b0a",
        ink: "#f4f3ef",
        accent: "#d8cfc0"
    }
};
const SETTINGS_SCHEMA = [
    {
        group: "Brand",
        keys: [
            {
                key: "portal_name",
                label: "Portal name",
                help: "Shown in the sidebar, the login screen, and every email-style message.",
                default: BRAND.name
            },
            {
                key: "portal_tagline",
                label: "Tagline",
                help: "One line under the wordmark on the login screen.",
                default: BRAND.tagline
            },
            {
                key: "accent_color",
                label: "Accent colour",
                help: "Hex value used for progress, focus rings, and the active state.",
                default: BRAND.colors.accent,
                type: "color"
            },
            {
                key: "support_email",
                label: "Support email",
                help: "Where clients are told to reach you.",
                default: BRAND.supportEmail
            },
            {
                key: "support_whatsapp",
                label: "WhatsApp link",
                help: "WhatsApp chat link shown in the Messages tab (wa.me link or phone number).",
                default: "https://wa.link/zthuqj"
            }
        ]
    },
    {
        group: "Creator program",
        keys: [
            {
                key: "welcome_headline",
                label: "Welcome headline",
                help: "The first line a new creator reads on the intro screen.",
                default: "Welcome to the Band9Prep Creator Program."
            },
            {
                key: "welcome_body",
                label: "Welcome body",
                help: "A short paragraph under the headline.",
                default: "Everything for the program lives in this portal: your profile, the guidelines, your video submissions, and your payouts. Work through it in order — the next module unlocks as you finish the one before it.",
                type: "textarea"
            },
            {
                key: "rate_min",
                label: "Indicative rate (min, NPR per 1,000 eligible views)",
                help: "Lower end of the advertised indicative range. A creator's exact rate is confirmed separately.",
                default: "50"
            },
            {
                key: "rate_max",
                label: "Indicative rate (max, NPR per 1,000 eligible views)",
                help: "Upper end of the advertised indicative range.",
                default: "60"
            },
            {
                key: "counting_window_days",
                label: "View-counting window (days)",
                help: "Days after posting during which views count as eligible.",
                default: "30"
            },
            {
                key: "platforms",
                label: "Supported platforms",
                help: "Comma-separated list shown to creators.",
                default: "TikTok, Instagram Reels, YouTube Shorts"
            },
            {
                key: "resources_url",
                label: "Resources link",
                help: "Optional link to a shared drive or handbook.",
                default: ""
            }
        ]
    }
];
const SETTING_DEFAULTS = Object.fromEntries(SETTINGS_SCHEMA.flatMap((g)=>g.keys.map((k)=>[
            k.key,
            k.default
        ])));
}),
"[project]/src/lib/settings.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "getSettings",
    ()=>getSettings,
    "safeColor",
    ()=>safeColor,
    "saveSettings",
    ()=>saveSettings
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$brand$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/brand.ts [app-rsc] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
async function getSettings() {
    const rows = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["all"])("SELECT key, value FROM settings");
    const stored = Object.fromEntries(rows.map((r)=>[
            r.key,
            r.value
        ]));
    const merged = {
        ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$brand$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SETTING_DEFAULTS"]
    };
    for (const [k, v] of Object.entries(stored)){
        if (v !== "") merged[k] = v;
        else if (k in __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$brand$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SETTING_DEFAULTS"]) merged[k] = "";
    }
    return merged;
}
async function saveSettings(patch) {
    for (const [key, value] of Object.entries(patch))await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["setSetting"])(key, String(value ?? ""));
}
function safeColor(value, fallback) {
    return /^#[0-9a-fA-F]{6}$/.test(value.trim()) ? value.trim() : fallback;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/app/layout.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>RootLayout,
    "generateMetadata",
    ()=>generateMetadata
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$geist_cfd9e230$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[next]/internal/font/google/geist_cfd9e230.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$geist_mono_3342dced$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[next]/internal/font/google/geist_mono_3342dced.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/settings.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$brand$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/brand.ts [app-rsc] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
async function generateMetadata() {
    const s = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getSettings"])();
    const name = s.portal_name || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$brand$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BRAND"].name;
    return {
        title: {
            default: `${name} · Creator Portal`,
            template: `%s · ${name}`
        },
        description: s.portal_tagline || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$brand$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BRAND"].description,
        icons: {
            icon: "/brand/favicon.svg"
        },
        openGraph: {
            title: `${name} · Creator Portal`,
            description: s.portal_tagline || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$brand$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BRAND"].description,
            images: [
                "/brand/og.jpg"
            ]
        }
    };
}
/** #rrggbb → "r, g, b", so the accent can drive the soft/glow variants too. */ function rgbTriplet(hex) {
    const h = hex.replace("#", "");
    return [
        0,
        2,
        4
    ].map((i)=>parseInt(h.slice(i, i + 2), 16)).join(", ");
}
async function RootLayout({ children }) {
    const s = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getSettings"])();
    const accent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["safeColor"])(s.accent_color || "", __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$brand$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BRAND"].colors.accent);
    const rgb = rgbTriplet(accent);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("html", {
        lang: "en",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("head", {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                    // The one runtime-themeable token: everything accent-coloured derives from it.
                    dangerouslySetInnerHTML: {
                        __html: `:root{--accent:${accent};--accent-soft:rgba(${rgb},0.12);--accent-glow:rgba(${rgb},0.30);}`
                    }
                }, void 0, false, {
                    fileName: "[project]/src/app/layout.tsx",
                    lineNumber: 35,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/layout.tsx",
                lineNumber: 34,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("body", {
                className: `${__TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$geist_cfd9e230$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].variable} ${__TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$geist_mono_3342dced$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].variable} antialiased`,
                children: children
            }, void 0, false, {
                fileName: "[project]/src/app/layout.tsx",
                lineNumber: 42,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/layout.tsx",
        lineNumber: 33,
        columnNumber: 5
    }, this);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-rsc] (ecmascript)").vendored['react-rsc'].ReactJsxDevRuntime; //# sourceMappingURL=react-jsx-dev-runtime.js.map
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__b3314d5a._.js.map