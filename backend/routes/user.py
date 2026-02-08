from flask import Blueprint, jsonify
from services.user_service import delete_user

user_bp = Blueprint('user', __name__)


@user_bp.route('/api/user/<user_id>', methods=['DELETE'])
def remove_user(user_id):
    """Delete a user account and all associated data."""
    success = delete_user(user_id)
    if success:
        return jsonify({"message": "Account deleted"}), 200
    else:
        return jsonify({"error": "Failed to delete account"}), 500
