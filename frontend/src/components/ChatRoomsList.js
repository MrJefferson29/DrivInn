import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaUserCircle, FaHome } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Container = styled.div`
  max-width: 600px;
  margin: 40px auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.07);
  padding: 24px;
`;
const RoomItem = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  &:last-child { border-bottom: none; }
`;
const Avatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #f7f7f7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-right: 16px;
  overflow: hidden;
`;
const RoomInfo = styled.div`
  flex: 1;
`;
const ListingThumb = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  object-fit: cover;
  margin-left: 16px;
`;

export default function ChatRoomsList() {
  const { user, token } = useAuth();
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;
          fetch('https://drivinn.onrender.com/chat/rooms', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setRooms);
  }, [token]);

  if (!user) return <Container>Please log in to view your messages.</Container>;

  return (
    <Container>
      <h2 style={{ marginBottom: 24 }}>Your Messages</h2>
      {rooms.length === 0 && <div>No conversations yet.</div>}
      {rooms.map(room => {
        // Show the other user (not self)
        const otherUser = room.users.find(u => u._id !== user.id && u._id !== user._id);
        return (
          <RoomItem key={room._id} onClick={() => navigate(`/messages/${room._id}`)}>
            <Avatar>
              {otherUser?.profileImage ? (
                <img src={otherUser.profileImage} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
              ) : (
                <FaUserCircle />
              )}
            </Avatar>
            <RoomInfo>
              <div style={{ fontWeight: 600 }}>{otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Unknown User'}</div>
              <div style={{ color: '#888', fontSize: 14 }}>{room.listing?.title || 'Listing'}</div>
            </RoomInfo>
            {room.listing?.images?.[0] && (
              <ListingThumb src={room.listing.images[0]} alt="listing" />
            )}
          </RoomItem>
        );
      })}
    </Container>
  );
} 