import axios from 'axios';
import React, { useState,useEffect } from 'react';
import './ChatOnline.css';

const ChatOnline = ({onlineUsers,currentId,setCurrentChat}) => {
    const [friends,setFriends] = useState([]);

    useEffect(() => {
        const getFriends = async()=>{
            const res = await axios.get("http://localhost:5000/cms/users/" + currentId)
            setFriends(res.data);
        }
        getFriends();
    }, [currentId]);

    // console.log(onlineUsers)
const handleClick = async(friend) =>{
    try {
        const res= await axios.get(`http://localhost:5000/conversations/find/${currentId}/${friend._id}`);
        setCurrentChat(res.data)
    } catch (error) {
        console.log(error)
    }
}


    return (
        <div className="chatOnline">
            {friends.map(friend=>(
                <div className="chatOnlineFriend" onClick={()=>handleClick(friend)}>
                <div className="chatOnlineImgContainer">
                    <img className="chatOnlineImg" src="/profile_default.jpg" alt=""/>
                    {onlineUsers.map(online=>(
                        (online._id===friend._id)?<div className="chatOnlineBadge"></div>:<div className="chatBadge"></div>
                    ))}
                    
                </div>
                <div className="chatOnlineName">{friend.name}</div>
            </div>
            ))}
        </div>
    )
}

export default ChatOnline
