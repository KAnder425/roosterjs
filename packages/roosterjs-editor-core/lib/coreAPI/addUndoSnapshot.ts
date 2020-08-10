import EditorCore, { AddUndoSnapshot } from '../interfaces/EditorCore';
import { Position } from 'roosterjs-editor-dom';
import {
    ChangeSource,
    ContentChangedEvent,
    NodePosition,
    PluginEventType,
    GetContentMode,
} from 'roosterjs-editor-types';

/**
 * Call an editing callback with adding undo snapshots around, and trigger a ContentChanged event if change source is specified.
 * Undo snapshot will not be added if this call is nested inside another addUndoSnapshot() call.
 * @param core The EditorCore object
 * @param callback The editing callback, accepting current selection start and end position, returns an optional object used as the data field of ContentChangedEvent.
 * @param changeSource The ChangeSource string of ContentChangedEvent. @default ChangeSource.Format. Set to null to avoid triggering ContentChangedEvent
 * @param canUndoByBackspace True if this action can be undone when user press Backspace key (aka Auto Complelte).
 */
export const addUndoSnapshot: AddUndoSnapshot = (
    core: EditorCore,
    callback: (start: NodePosition, end: NodePosition, snapshotBeforeCallback: string) => any,
    changeSource: ChangeSource | string,
    canUndoByBackspace: boolean
) => {
    let isNested = core.undo.value.outerUndoSnapshot !== null;
    let data: any;

    if (!isNested) {
        core.undo.value.outerUndoSnapshot = addSnapshot(core);
    }

    const autoCompleteSnapshot = canUndoByBackspace && core.undo.value.outerUndoSnapshot;

    try {
        if (callback) {
            let range = core.api.getSelectionRange(core, true /*tryGetFromCache*/);
            data = callback(
                range && Position.getStart(range).normalize(),
                range && Position.getEnd(range).normalize(),
                core.undo.value.outerUndoSnapshot
            );

            if (!isNested) {
                addSnapshot(core);
            }
        }
    } finally {
        if (!isNested) {
            core.undo.value.outerUndoSnapshot = null;
        }
    }

    if (callback && changeSource) {
        let event: ContentChangedEvent = {
            eventType: PluginEventType.ContentChanged,
            source: changeSource,
            data: data,
        };
        core.api.triggerEvent(core, event, true /*broadcast*/);
    }

    if (canUndoByBackspace) {
        // Need to set this snapshot after ContentChangedEvent is fired to avoid it is cleared by event handler in AutoCompletePlugin
        core.autoComplete.value = autoCompleteSnapshot;
    }
};

function addSnapshot(core: EditorCore) {
    let snapshot = core.api.getContent(core, GetContentMode.RawHTMLWithSelection);
    core.undo.value.snapshotsService.addSnapshot(snapshot);
    core.undo.value.hasNewContent = false;
    return snapshot;
}