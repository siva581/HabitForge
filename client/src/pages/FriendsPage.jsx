import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Avatar } from "../components/Avatar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api/client.js";

function updateFriendStatus(users, userId, isFriend) {
  return users.map((user) => (user.id === userId ? { ...user, isFriend } : user));
}

export function FriendsPage() {
  const { announceReward } = useAuth();
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    loadFriends();
  }, []);

  async function loadFriends() {
    try {
      setLoadingFriends(true);
      const response = await api.get("/friends");
      setFriends(response.friends || []);
    } catch (friendError) {
      setError(friendError.message);
    } finally {
      setLoadingFriends(false);
    }
  }

  async function handleSearch(event) {
    event.preventDefault();
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setSearchResults([]);
      setError("Type at least 2 characters to search users.");
      return;
    }

    try {
      setSearching(true);
      setError("");
      const response = await api.get(`/users/search?q=${encodeURIComponent(trimmed)}`);
      setSearchResults(response.users || []);
    } catch (searchError) {
      setError(searchError.message);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }

  async function addFriend(userId) {
    try {
      setActionId(userId);
      await api.post(`/friends/${userId}`);
      await loadFriends();
      setSearchResults((current) => updateFriendStatus(current, userId, true));
      announceReward({
        icon: "👥",
        title: "Friend added",
        message: "They’re now part of your circle"
      });
    } catch (friendError) {
      setError(friendError.message);
    } finally {
      setActionId(null);
    }
  }

  async function removeFriend(userId) {
    try {
      setActionId(userId);
      await api.del(`/friends/${userId}`);
      await loadFriends();
      setSearchResults((current) => updateFriendStatus(current, userId, false));
      announceReward({
        icon: "🫱",
        title: "Friend removed",
        message: "Their score is no longer in your circle"
      });
    } catch (friendError) {
      setError(friendError.message);
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="friends-page">
      <section className="panel-card friends-hero">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Social circle</p>
            <h2>Find and add friends</h2>
          </div>
          <Link to="/dashboard/leaderboard" className="ghost-button friends-cta">Back to leaderboard</Link>
        </div>
        <p className="section-description">Search by name or email, then add people to your HabitForge network.</p>
      </section>

      <section className="panel-card friends-search-card">
        <form className="friends-search" onSubmit={handleSearch}>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search people by name or email"
          />
          <button className="primary-button" type="submit" disabled={searching}>
            {searching ? "Searching..." : "Search"}
          </button>
        </form>
        {error && <p className="form-error">{error}</p>}
        {!searching && searchResults.length === 0 && query.trim().length >= 2 && !error && (
          <p className="section-description">No matching users found.</p>
        )}

        <div className="friends-results">
          {searchResults.map((user) => (
            <motion.article
              key={user.id}
              className="friend-card"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Avatar seed={user.avatarSeed} size={52} />
              <div className="friend-info">
                <div className="friend-name-row">
                  <h3>{user.name}</h3>
                  {user.isPremium && <span className="premium-badge">★</span>}
                </div>
                <p>{user.email}</p>
                <span className="friend-meta">Level {user.level || 1} · {user.xp || 0} XP</span>
              </div>
              <button
                type="button"
                className={user.isFriend ? "ghost-button" : "primary-button"}
                onClick={() => (user.isFriend ? removeFriend(user.id) : addFriend(user.id))}
                disabled={actionId === user.id}
              >
                {actionId === user.id ? "Updating..." : user.isFriend ? "Remove" : "Add friend"}
              </button>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="panel-card friends-list-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Current friends</p>
            <h3>Your circle</h3>
          </div>
          <span className="achievement-count">{friends.length}</span>
        </div>
        {loadingFriends ? (
          <p>Loading friends...</p>
        ) : friends.length === 0 ? (
          <p className="section-description">You have not added any friends yet.</p>
        ) : (
          <div className="friends-list">
            {friends.map((friend) => (
              <motion.article
                key={friend.id}
                className="friend-card compact"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Avatar seed={friend.avatarSeed} size={44} />
                <div className="friend-info">
                  <div className="friend-name-row">
                    <h3>{friend.name}</h3>
                    {friend.isPremium && <span className="premium-badge">★</span>}
                  </div>
                  <span className="friend-meta">Level {friend.level || 1} · {friend.xp || 0} XP</span>
                </div>
                <button type="button" className="ghost-button" onClick={() => removeFriend(friend.id)} disabled={actionId === friend.id}>
                  Remove
                </button>
              </motion.article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}