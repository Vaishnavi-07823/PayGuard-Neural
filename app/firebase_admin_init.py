"""
firebase_admin_init.py — Firebase Admin SDK initialization for PayGuard-Neural backend.

WHAT: Initializes the firebase_admin SDK using a service account key file.
      Exposes `verify_firebase_token(token)` which validates an ID token and
      returns the decoded payload, including the `uid`.

WHY:  All protected API routes must verify the caller's Firebase ID token
      server-side (never trust client-supplied role claims in the request body).
      Role is always fetched from Firestore `users/{uid}.role` after token
      verification — never from the token itself.

SETUP:
  1. Go to Firebase Console → Project Settings → Service Accounts.
  2. Click "Generate new private key" → download `serviceAccountKey.json`.
  3. Place the file at: PayGuard-Neural/app/serviceAccountKey.json
  4. This file is git-ignored — never commit it.
"""

import os
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth, firestore

_initialized = False


def _init():
    global _initialized
    if _initialized:
        return
    key_path = os.path.join(os.path.dirname(__file__), "serviceAccountKey.json")
    if os.path.exists(key_path):
        cred = credentials.Certificate(key_path)
        firebase_admin.initialize_app(cred)
        _initialized = True
        print("[Firebase Admin] Initialized from serviceAccountKey.json")
    else:
        # Fall back: no service account file → Firebase Admin SDK not available.
        # API routes that require it will return a 503 with an instructive message.
        print("[Firebase Admin] WARNING: serviceAccountKey.json not found.")
        print("[Firebase Admin] Token verification and role checks will be DISABLED.")
        print("[Firebase Admin] Place serviceAccountKey.json in the app/ directory.")


def verify_firebase_token(id_token: str) -> dict:
    """
    Verifies a Firebase ID token and returns the decoded payload.
    Raises ValueError with a human-readable message on any failure.
    """
    if not _initialized:
        raise ValueError(
            "Firebase Admin SDK not initialized. "
            "Place serviceAccountKey.json in the app/ directory."
        )
    try:
        decoded = firebase_auth.verify_id_token(id_token)
        return decoded
    except firebase_auth.ExpiredIdTokenError:
        raise ValueError("Token expired — please sign in again.")
    except firebase_auth.InvalidIdTokenError:
        raise ValueError("Invalid token.")
    except Exception as e:
        raise ValueError(f"Token verification failed: {e}")


def get_firestore_db():
    """Returns a Firestore client (Firebase Admin). Requires SDK to be initialized."""
    if not _initialized:
        raise ValueError("Firebase Admin SDK not initialized.")
    return firestore.client()


def get_user_role(uid: str) -> str:
    """
    Fetches the user's role from Firestore `users/{uid}.role`.
    Returns 'user' as a safe default if the doc is missing.
    This is the ONLY source of truth for authorization — never trust
    client-supplied role claims.
    """
    fdb = get_firestore_db()
    snap = fdb.collection("users").document(uid).get()
    if snap.exists:
        return snap.to_dict().get("role", "user")
    return "user"


def check_police_allowlist(email: str) -> bool:
    """
    Checks if the given email address exists in the `police_allowlist`
    Firestore collection. This collection is NOT readable from the client.
    Returns True if authorized, False otherwise.
    """
    fdb = get_firestore_db()
    doc = fdb.collection("police_allowlist").document(email.lower()).get()
    return doc.exists


def set_user_role(uid: str, role: str) -> None:
    """
    Sets the user's role in Firestore `users/{uid}.role`.
    This MUST only be called from server-side (backend) code.
    The Firestore security rules prevent clients from writing to the role field.
    """
    fdb = get_firestore_db()
    fdb.collection("users").document(uid).update({"role": role})


# Auto-init when module is imported
_init()
