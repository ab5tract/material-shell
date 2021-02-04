/** Gnome libs imports */
import * as GLib from 'glib';

/** Extension imports */
const Me = imports.misc.extensionUtils.getCurrentExtension();

const DEBUG = true;
const FOCUS_ONLY = false;
let indent = 0;
export function initDebug() {
    // TODO: Essentially dead code
    const AddLogToFunctions = function (prototype) {
        if (!DEBUG) return;
        for (const key of Object.getOwnPropertyNames(prototype)) {
            if (key === 'constructor') continue;
            const descriptor = Object.getOwnPropertyDescriptor(prototype, key);
            if (descriptor) {
                const value = descriptor.value;
                if (typeof value === 'function') {
                    prototype[key] = function (...args) {
                        // Before
                        Me.log(
                            `${prototype.constructor.name}.${key} (${Array.from(
                                args
                            )
                                .map((param) => {
                                    try {
                                        return param.toString();
                                    } catch (_e) {
                                        return '';
                                    }
                                })
                                .join(',')})`
                        );
                        indent++;
                        const result = value.apply(this, args); // use .apply() to call it
                        // After

                        indent--;
                        return result;
                    };
                }
            }
        }
    };

    Me.log = function (message: string, ...args: any[]) {
        if (!DEBUG || FOCUS_ONLY) return;
        const fields = { MESSAGE: `${'  '.repeat(indent)}${args.join(', ')}` };
        const domain = 'Material Shell';

        GLib.log_structured(domain, GLib.LogLevelFlags.LEVEL_MESSAGE, fields);
    };

    Me.logFocus = function (message: string, ...args: any[]) {
        if (!DEBUG) return;
        const fields = { MESSAGE: `${'##'.repeat(indent)}${args.join(', ')}` };
        const domain = 'Material Shell';

        GLib.log_structured(domain, GLib.LogLevelFlags.LEVEL_MESSAGE, fields);
    };

    let doLogTick = false;
    /* exported startLogTick */
    const startLogTick = function () {
        doLogTick = true;
        logTick();
    };

    function logTick() {
        GLib.idle_add(GLib.PRIORITY_DEFAULT, () => {
            if (doLogTick) {
                logTick();
            }
            return GLib.SOURCE_REMOVE;
        });
    }
    /* exported stopLogTick */
    const stopLogTick = function () {
        doLogTick = false;
    };

    Me.logBlank = function () {
        for (let i = 0; i < 50; i++) {
            Me.logFocus('');
        }
    };

    if (DEBUG) {
        // In IDLE otherwise all the files are not yet enabled since this is called during the file inventory
        GLib.idle_add(GLib.PRIORITY_DEFAULT, () => {
            const objects: any[] = [
                /* Me.imports.src.manager.msWindowManager.MsWindowManager,
                Me.imports.src.manager.msWorkspaceManager.MsWorkspaceManager,
                Me.imports.src.manager.msThemeManager.MsThemeManager,
                Me.imports.src.layout.main.MsMain,
                Me.imports.src.layout.msWorkspace.msWorkspace.MsWorkspace,
                Me.imports.src.layout.msWorkspace.msWindow.MsWindow,
                Me.imports.src.layout.msWorkspace.horizontalPanel.taskBar
                    .TaskBar,
                Me.imports.src.layout.msWorkspace.horizontalPanel.taskBar
                    .TaskBarItem,
                Me.imports.src.layout.msWorkspace.horizontalPanel.taskBar
                    .IconTaskBarItem,
                Me.imports.src.layout.msWorkspace.horizontalPanel.taskBar
                    .TaskActiveIndicator,
                Me.imports.src.layout.msWorkspace.horizontalPanel.taskBar
                    .TileableItem,
                Me.imports.src.layout.msWorkspace.horizontalPanel.layoutSwitcher
                    .LayoutSwitcher,
                Me.imports.src.layout.msWorkspace.horizontalPanel.layoutSwitcher
                    .TilingLayoutMenuItem,
                Me.imports.src.widget.reorderableList.ReorderableList, */
            ];
            objects
                .filter((object) => object)
                .forEach((object) => AddLogToFunctions(object.prototype));
            return false;
        });
    }
}
