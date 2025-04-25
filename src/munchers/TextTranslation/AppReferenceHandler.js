import {
  ScriptureReferenceHandler,
  ReferenceChangeSource,
  ReferenceChangeEvent,
} from "@scriptural/react";
import { ScriptureReference } from "@scriptural/react/internal-packages/shared-react/plugins/ScriptureReferencePlugin";

export class AppReferenceHandler {
  constructor(initialReference) {
    this.reference = initialReference;
    this.subscribers = [];
    this.updateInProgress = false;
    this.source = "app";
  }

  getReference() {
    return this.reference;
  }

  setReference(
    ref,
    source = "user_navigation",
    metadata,
  ) {
    // Skip if reference hasn't changed to prevent loops
    if (this.areReferencesEqual(this.reference, ref)) {
      return;
    }

    // Update reference
    this.reference = ref;

    // Prevent recursive updates
    if (!this.updateInProgress) {
      this.updateInProgress = true;
      try {
        // Can add any app-specific logic here to sync with other systems

        // Notify all subscribers
        this.notifySubscribers({
          reference: ref,
          source: source,
          metadata: {
            ...metadata,
            origin: this.source,
          },
        });
      } finally {
        this.updateInProgress = false;
      }
    }
  }

  subscribe(callback) {
    this.subscribers.push(callback);

    // Immediately notify with current value
    callback({
      reference: this.reference,
      source: "initial_load",
      metadata: {
        origin: this.source,
      },
    });

    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter((cb) => cb !== callback);
    };
  }

  setSource(source) {
    this.source = source;
  }

  notifySubscribers(event) {
    this.subscribers.forEach((callback) => callback(event));
  }

  areReferencesEqual(a, b) {
    if (a === b) return true;
    if (!a || !b) return false;
    return a.book === b.book && a.chapter === b.chapter && a.verse === b.verse;
  }
}
