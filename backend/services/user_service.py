from services.database import supabase, supabase_admin


def delete_user(user_id: str) -> bool:
    """Delete a user and all their associated data."""
    try:
        # Delete user's saved destinations
        supabase.table("saved_destinations").delete().eq("user_id", user_id).execute()

        # Delete user's trips
        supabase.table("trips").delete().eq("user_id", user_id).execute()

        # Delete the user account via Supabase Auth Admin API
        supabase_admin.auth.admin.delete_user(user_id)

        print(f"Deleted user {user_id} and all associated data", flush=True)
        return True
    except Exception as e:
        print(f"Error deleting user {user_id}: {e}", flush=True)
        return False
