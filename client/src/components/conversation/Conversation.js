import axios from 'axios';
import React, { useState,useEffect } from 'react';
import "./Conversation.css"

const Conversation = ({conversation, currentUser}) => {
    const [users,setUsers] = useState(null);

    useEffect(()=>{
        const memberId = conversation.members.find((m) => m!==currentUser.id);
        //console.log(memberId)

        const getUser = async()=>{
            try {
                const res = await axios("http://localhost:5000/cms/getUser?userId=" + memberId);
                //console.log(res);
                setUsers(res.data)
            } catch (error) {
                console.log(error)
            } 
        };
        getUser()
    },[currentUser, conversation])

    //console.log(users);

    return (
        <>
        <div className="conversation">
            <img className="conversationImg"
            src="/profile_default.jpg"
            alt=""
            />
            <span className="conversationName">{users?.name}</span>
        </div>   
        </>
    )
}

export default Conversation
