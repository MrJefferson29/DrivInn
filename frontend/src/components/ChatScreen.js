import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import styled from 'styled-components';
import { FaPaperPlane, FaImage, FaMapMarkerAlt, FaCheck, FaTimes, FaUserCircle, FaHome, FaSearch, FaEllipsisV, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const airbnbRed = '#FF385C';
const airbnbDark = '#222222';
const airbnbGray = '#717171';
const airbnbLightGray = '#F7F7F7';
const airbnbBorder = '#DDDDDD';

const ChatContainer = styled.div`
  display: flex;
  height: 100vh;
  background: #fff;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Sidebar = styled.div`
  width: 350px;
  border-right: 1px solid ${airbnbBorder};
  background: #fff;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid ${airbnbBorder};
    height: 60vh;
    display: ${({ showSidebar }) => showSidebar ? 'flex' : 'none'};
  }
  
  @media (max-width: 480px) {
    height: 50vh;
  }
`;

const SidebarHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid ${airbnbBorder};
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const SearchBar = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid ${airbnbBorder};
  
  @media (max-width: 768px) {
    padding: 12px 16px;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${airbnbBorder};
  border-radius: 8px;
  font-size: 14px;
  background: ${airbnbLightGray};
  
  &:focus {
    outline: none;
    border-color: ${airbnbRed};
  }
  
  @media (max-width: 768px) {
    padding: 10px 14px;
    font-size: 16px; /* Prevent zoom on iOS */
  }
`;

const ChatRoomsList = styled.div`
  flex: 1;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    max-height: calc(100% - 140px);
  }
`;

const ChatRoomItem = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  border-bottom: 1px solid ${airbnbBorder};
  transition: background-color 0.2s;
  
  &:hover {
    background: ${airbnbLightGray};
  }
  
  &.active {
    background: ${airbnbRed}10;
    border-left: 3px solid ${airbnbRed};
  }
  
  @media (max-width: 768px) {
    padding: 14px 16px;
  }
`;

const RoomAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${airbnbLightGray};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-right: 12px;
  overflow: hidden;
  flex-shrink: 0;
  
  @media (max-width: 480px) {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
    margin-right: 10px;
  }
`;

const RoomInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const RoomName = styled.div`
  font-weight: 600;
  color: ${airbnbDark};
  font-size: 14px;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const RoomPreview = styled.div`
  color: ${airbnbGray};
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const MainChat = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: ${airbnbLightGray};
  
  @media (max-width: 768px) {
    height: 40vh;
    display: ${({ showSidebar }) => showSidebar ? 'none' : 'flex'};
  }
  
  @media (max-width: 480px) {
    height: 50vh;
  }
`;

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 24px;
  background: #fff;
  border-bottom: 1px solid ${airbnbBorder};
  gap: 12px;
  
  @media (max-width: 768px) {
    padding: 12px 16px;
    gap: 10px;
  }
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  color: ${airbnbGray};
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: ${airbnbLightGray};
  }
  
  @media (max-width: 768px) {
    font-size: 16px;
    padding: 6px;
  }
`;

const HeaderAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${airbnbLightGray};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  overflow: hidden;
  
  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
    font-size: 1rem;
  }
`;

const HeaderInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const HeaderName = styled.div`
  font-weight: 600;
  color: ${airbnbDark};
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

const HeaderSubtitle = styled.div`
  color: ${airbnbGray};
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
  
  @media (max-width: 768px) {
    gap: 6px;
  }
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  font-size: 16px;
  color: ${airbnbGray};
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: ${airbnbLightGray};
    color: ${airbnbDark};
  }
  
  @media (max-width: 768px) {
    font-size: 14px;
    padding: 6px;
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  @media (max-width: 768px) {
    padding: 16px;
    gap: 6px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
  }
`;

const MessageBubble = styled.div`
  background: ${({ isMe }) => (isMe ? airbnbRed : '#fff')};
  color: ${({ isMe }) => (isMe ? '#fff' : airbnbDark)};
  padding: 12px 16px;
  border-radius: 18px;
  max-width: 70%;
  align-self: ${({ isMe }) => (isMe ? 'flex-end' : 'flex-start')};
  font-size: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  word-break: break-word;
  position: relative;
  margin-bottom: 4px;
  
  @media (max-width: 768px) {
    max-width: 85%;
    font-size: 13px;
    padding: 10px 14px;
  }
  
  @media (max-width: 480px) {
    max-width: 90%;
    font-size: 12px;
    padding: 8px 12px;
  }
`;

const MessageTime = styled.div`
  font-size: 11px;
  color: ${({ isMe }) => (isMe ? 'rgba(255,255,255,0.7)' : airbnbGray)};
  margin-top: 4px;
  text-align: ${({ isMe }) => (isMe ? 'right' : 'left')};
  
  @media (max-width: 480px) {
    font-size: 10px;
  }
`;

const ImageMessage = styled.img`
  max-width: 300px;
  max-height: 300px;
  border-radius: 12px;
  margin-top: 8px;
  
  @media (max-width: 768px) {
    max-width: 250px;
    max-height: 250px;
  }
  
  @media (max-width: 480px) {
    max-width: 200px;
    max-height: 200px;
  }
`;

const LocationMessage = styled.a`
  display: flex;
  align-items: center;
  gap: 8px;
  color: inherit;
  text-decoration: none;
  padding: 8px 12px;
  background: rgba(255,255,255,0.1);
  border-radius: 8px;
  margin-top: 8px;
  
  &:hover {
    background: rgba(255,255,255,0.2);
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
    padding: 6px 10px;
  }
`;

const InputContainer = styled.div`
  padding: 20px;
  background: #fff;
  border-top: 1px solid ${airbnbBorder};
  
  @media (max-width: 768px) {
    padding: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
  }
`;

const InputForm = styled.form`
  display: flex;
  align-items: flex-end;
  gap: 12px;
  background: ${airbnbLightGray};
  border-radius: 24px;
  padding: 8px 16px;
  border: 1px solid ${airbnbBorder};
  
  &:focus-within {
    border-color: ${airbnbRed};
  }
  
  @media (max-width: 768px) {
    gap: 10px;
    padding: 6px 14px;
  }
  
  @media (max-width: 480px) {
    gap: 8px;
    padding: 6px 12px;
  }
`;

const MessageInput = styled.textarea`
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  resize: none;
  max-height: 120px;
  min-height: 20px;
  padding: 8px 0;
  font-family: inherit;
  
  &:focus {
    outline: none;
  }
  
  &::placeholder {
    color: ${airbnbGray};
  }
  
  @media (max-width: 768px) {
    font-size: 16px; /* Prevent zoom on iOS */
    padding: 6px 0;
  }
  
  @media (max-width: 480px) {
    font-size: 14px;
    padding: 4px 0;
  }
`;

const InputActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  
  @media (max-width: 768px) {
    gap: 6px;
  }
  
  @media (max-width: 480px) {
    gap: 4px;
  }
`;

const InputButton = styled.button`
  background: none;
  border: none;
  font-size: 16px;
  color: ${airbnbGray};
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    color: ${airbnbRed};
    background: rgba(255,56,92,0.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    font-size: 14px;
    padding: 6px;
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
    padding: 4px;
  }
`;

const SendButton = styled(InputButton)`
  background: ${airbnbRed};
  color: white;
  
  &:hover {
    background: ${airbnbRed};
    transform: scale(1.05);
  }
  
  &:disabled {
    background: ${airbnbGray};
    transform: none;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: ${airbnbGray};
  
  @media (max-width: 768px) {
    padding: 30px;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  text-align: center;
  padding: 16px;
  background: #fdf2f2;
  border-radius: 8px;
  margin: 16px;
  
  @media (max-width: 768px) {
    padding: 12px;
    margin: 12px;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${airbnbGray};
  text-align: center;
  padding: 40px;
  
  @media (max-width: 768px) {
    padding: 30px;
  }
  
  @media (max-width: 480px) {
    padding: 20px;
  }
`;

const MobileToggle = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 18px;
  color: ${airbnbGray};
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  &:hover {
    background: ${airbnbLightGray};
  }
`;

const socket = io('http://localhost:5000');

export default function ChatScreen(props) {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const userId = user?.id || user?._id;
  const chatRoomId = props.chatRoomId || roomId;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [showMapInput, setShowMapInput] = useState(false);
  const [mapCoords, setMapCoords] = useState({ lat: '', lng: '' });
  const [roomInfo, setRoomInfo] = useState(null);
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Fetch chat rooms
  useEffect(() => {
    if (!token) return;
    fetch('http://localhost:5000/chat/rooms', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setChatRooms);
  }, [token]);

  // Fetch room info for header
  useEffect(() => {
    if (!chatRoomId || !token) return;
    const room = chatRooms.find(r => r._id === chatRoomId);
    setRoomInfo(room);
  }, [chatRoomId, chatRooms, token]);

  // Fetch messages
  useEffect(() => {
    if (!chatRoomId) return;
    setLoading(true);
    setError('');
    fetch(`http://localhost:5000/chat/messages/${chatRoomId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch messages');
        return res.json();
      })
      .then(fetchedMessages => setMessages(fetchedMessages))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [chatRoomId, token]);

  // Socket.IO connection
  useEffect(() => {
    socket.emit('joinRoom', { chatRoomId });
    const handleReceive = (msg) => {
      setMessages(prev => {
        if (prev.some(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };
    socket.on('receiveMessage', handleReceive);
    return () => {
      socket.off('receiveMessage', handleReceive);
    };
  }, [chatRoomId]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [text]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (uploading) return;
    
    if (showMapInput && mapCoords.lat && mapCoords.lng) {
      try {
        const response = await fetch('http://localhost:5000/chat/message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            chatRoomId,
            type: 'location',
            lat: mapCoords.lat,
            lng: mapCoords.lng
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to send location');
        }
        
        setShowMapInput(false);
        setMapCoords({ lat: '', lng: '' });
      } catch (error) {
        setError('Failed to send location. Please try again.');
        console.error('Error sending location:', error);
      }
      return;
    }
    
    if (image) {
      setUploading(true);
      const formData = new FormData();
      formData.append('chatRoomId', chatRoomId);
      formData.append('type', 'image');
      formData.append('image', image);
      await fetch('http://localhost:5000/chat/message', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      setImage(null);
      fetch(`http://localhost:5000/chat/messages/${chatRoomId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(setMessages)
        .finally(() => setUploading(false));
      return;
    }
    
    if (text.trim()) {
      try {
        const response = await fetch('http://localhost:5000/chat/message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            chatRoomId,
            type: 'text',
            text: text.trim()
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to send message');
        }
        
        setText('');
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      } catch (error) {
        setError('Failed to send message. Please try again.');
        console.error('Error sending message:', error);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  const filteredRooms = chatRooms.filter(room => {
    const otherUser = room.users.find(u => u._id !== userId);
    const userName = otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : '';
    const listingTitle = room.listing?.title || '';
    return userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
           listingTitle.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Get chat partner and listing info
  let otherUser = null, listing = null;
  if (roomInfo && userId) {
    otherUser = roomInfo.users.find(u => u._id !== userId);
    listing = roomInfo.listing;
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Auto-hide sidebar on mobile when chat is selected
  useEffect(() => {
    if (window.innerWidth <= 768 && chatRoomId) {
      setShowSidebar(false);
    }
  }, [chatRoomId]);

  if (!user) {
    return (
      <EmptyState>
        <h3>Please log in to view your messages</h3>
      </EmptyState>
    );
  }

      return (
      <ChatContainer>
                <Sidebar showSidebar={showSidebar}>
          <SidebarHeader>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Messages</h2>
            <ActionButton onClick={() => setShowSidebar(false)}>
              <FaEllipsisV />
            </ActionButton>
          </SidebarHeader>
        
        <SearchBar>
          <SearchInput
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBar>
        
        <ChatRoomsList>
          {filteredRooms.map(room => {
            const otherUser = room.users.find(u => u._id !== userId);
            return (
              <ChatRoomItem
                key={room._id}
                className={room._id === chatRoomId ? 'active' : ''}
                onClick={() => navigate(`/messages/${room._id}`)}
              >
                <RoomAvatar>
                  {otherUser?.profileImage ? (
                    <img src={otherUser.profileImage} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                  ) : (
                    <FaUserCircle />
                  )}
                </RoomAvatar>
                <RoomInfo>
                  <RoomName>{otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Unknown User'}</RoomName>
                  <RoomPreview>{room.listing?.title || 'Listing'}</RoomPreview>
                </RoomInfo>
              </ChatRoomItem>
            );
          })}
        </ChatRoomsList>
      </Sidebar>
      
              <MainChat showSidebar={showSidebar}>
          {chatRoomId ? (
          <>
                          <ChatHeader>
                <BackButton onClick={() => {
                  if (window.innerWidth <= 768) {
                    setShowSidebar(true);
                  } else {
                    navigate('/messages');
                  }
                }}>
                  <FaArrowLeft />
                </BackButton>
              <HeaderAvatar>
                {otherUser?.profileImage ? (
                  <img src={otherUser.profileImage} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                ) : (
                  <FaUserCircle />
                )}
              </HeaderAvatar>
              <HeaderInfo>
                <HeaderName>{otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'User'}</HeaderName>
                <HeaderSubtitle>
                  <FaHome style={{ color: airbnbRed, fontSize: 12 }} />
                  {listing?.title || 'Listing'}
                </HeaderSubtitle>
              </HeaderInfo>
                             <HeaderActions>
                 <ActionButton>
                   <FaSearch />
                 </ActionButton>
                 <ActionButton onClick={() => setShowSidebar(true)}>
                   <FaEllipsisV />
                 </ActionButton>
               </HeaderActions>
            </ChatHeader>
            
            <MessagesContainer>
              {loading && <LoadingSpinner>Loading messages...</LoadingSpinner>}
              {error && <ErrorMessage>{error}</ErrorMessage>}
              {messages.map((msg, idx) => (
                <MessageBubble key={idx} isMe={msg.sender === userId}>
                  {msg.type === 'text' && msg.text}
                  {msg.type === 'image' && (
                    <ImageMessage src={msg.imageUrl} alt="shared" />
                  )}
                  {msg.type === 'location' && (
                    <LocationMessage
                      href={`https://www.google.com/maps/search/?api=1&query=${msg.location.lat},${msg.location.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaMapMarkerAlt />
                      Shared Location: {msg.location.lat}, {msg.location.lng}
                    </LocationMessage>
                  )}
                  <MessageTime isMe={msg.sender === userId}>
                    {formatTime(msg.createdAt)}
                  </MessageTime>
                </MessageBubble>
              ))}
              <div ref={messagesEndRef} />
            </MessagesContainer>
            
            <InputContainer>
              <InputForm onSubmit={sendMessage}>
                {showMapInput ? (
                  <>
                    <MessageInput
                      type="number"
                      placeholder="Latitude"
                      value={mapCoords.lat}
                      onChange={e => setMapCoords({ ...mapCoords, lat: e.target.value })}
                      required
                    />
                    <MessageInput
                      type="number"
                      placeholder="Longitude"
                      value={mapCoords.lng}
                      onChange={e => setMapCoords({ ...mapCoords, lng: e.target.value })}
                      required
                    />
                    <InputButton type="submit"><FaCheck /></InputButton>
                    <InputButton type="button" onClick={() => setShowMapInput(false)}><FaTimes /></InputButton>
                  </>
                ) : (
                  <>
                                         <MessageInput
                       ref={textareaRef}
                       placeholder="Type a message..."
                       value={text}
                       onChange={e => setText(e.target.value)}
                       onKeyPress={handleKeyPress}
                       rows={1}
                       style={{ minHeight: window.innerWidth <= 480 ? '36px' : '20px' }}
                     />
                    <InputActions>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="chat-image-upload"
                        onChange={e => setImage(e.target.files[0])}
                      />
                      <label htmlFor="chat-image-upload">
                        <InputButton as="span"><FaImage /></InputButton>
                      </label>
                      <InputButton type="button" onClick={() => setShowMapInput(true)}>
                        <FaMapMarkerAlt />
                      </InputButton>
                      <SendButton type="submit" disabled={uploading || loading}>
                        {uploading ? 'Uploading...' : <FaPaperPlane />}
                      </SendButton>
                    </InputActions>
                  </>
                )}
              </InputForm>
            </InputContainer>
          </>
                 ) : (
           <EmptyState>
             <FaUserCircle style={{ fontSize: '48px', marginBottom: '16px' }} />
             <h3>Select a conversation</h3>
             <p style={{ margin: '8px 0' }}>
               {window.innerWidth <= 768 
                 ? 'Tap the menu button to view your conversations'
                 : 'Choose a conversation from the sidebar to start messaging'
               }
             </p>
           </EmptyState>
         )}
      </MainChat>
    </ChatContainer>
  );
} 