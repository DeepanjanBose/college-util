import React, { useContext, useState,useEffect,useRef } from 'react';
import "./Messenger.css";
import {Grid, Button, Icon} from "semantic-ui-react";
import Conversation from '../conversation/Conversation';
import Message from '../message/Message';
import ChatOnline from '../chatOnline/ChatOnline';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import {io} from 'socket.io-client';


const Messenger = () => {

    const [conversation, setConversation] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [arrivalMessage, setArrivalMessage] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const scrollRef = useRef();
    const socket = useRef();
    const {user} = useContext(AuthContext);
    

    useEffect(() => {
        socket.current = io("ws://localhost:8080");
        socket.current.on("getMessage", (data) => {
          setArrivalMessage({
            sender: data.senderId,
            text: data.text,
            createdAt: Date.now(),
          });
        });
    },[]);

    useEffect(()=>{
        arrivalMessage && currentChat?.members.includes(arrivalMessage.sender) &&
        setMessages(prev=>[...prev,arrivalMessage]);
    },[arrivalMessage, currentChat])

    useEffect(()=>{
        socket.current.emit("addUser",user.id);
        socket.current.on("getUsers",users=>{
        axios.get("http://localhost:5000/cms/users/" + user.id)
        .then(res=>setOnlineUsers(res.data.filter((f)=> users.some((u)=> u.userId === f._id))))
        })
    },[user])
    //console.log(onlineUsers);

    
    useEffect(() => {
        const getConversations = async () =>{
            try {
                //console.log(user.id)
                const res = await axios.get("http://localhost:5000/conversations/" + user?.id);
                //console.log(res.data); 
                setConversation(res.data);
            } catch (error) {
                console.log(error)
            }
        }
        getConversations();
    }, [user.id]);

    //console.log(currentChat)

    useEffect(()=>{
        const getMessages = async()=>{
            try {
                const res= await axios.get("http://localhost:5000/messages/"+ currentChat?._id)
                setMessages(res.data);
            } catch (error) {
                console.log(error)
            }  
        }
        getMessages();
    },[currentChat]);

    //console.log(messages);

    const handleSubmit = async(e)=>{
        e.preventDefault();
        const message = {
            sender: user.id,
            text:newMessage,
            conversationId: currentChat._id,
        }

        const receiverId = currentChat.members.find(member => member !==user.id)

        socket.current.emit("sendMessage",{
            senderId : user.id,
            receiverId : receiverId,
            text: newMessage,
        })

        try {
            const res = await axios.post("http://localhost:5000/messages/",message)
            setMessages([...messages,res.data]);
            setNewMessage("");
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }, [messages]);

    return (
        <>
            <Grid >
                <Grid.Row>
                    <Grid.Column width={5} >
                        <div className="chatMenuWrapper">
                            <input placeholder="Search for friends" className="chatMenuInput"/>
                            {conversation.map((c)=>(
                                <div onClick={()=>setCurrentChat(c)}>
                                    <Conversation conversation={c} currentUser={user}/>
                                </div>
                            ))}
                            
                        </div>
                    </Grid.Column>
                    <Grid.Column width={8}>
                    <div className="chatBoxWrapper">
                        {
                            currentChat ?
                            <>
                                <div className="chatBoxTop">
                                    {messages.map((m)=>(
                                        <div ref={scrollRef}>
                                            <Message message={m} own={m.sender === user.id}/>
                                        </div>
                                        
                                    ))}
                                </div>
                                <div className="chatBoxBottom">
                                    <textarea 
                                    className="chatMessageInput" 
                                    placeholder="write something ..."
                                    onChange={(e)=>setNewMessage(e.target.value)}
                                    value={newMessage}
                                    ></textarea>
                                    <Button animated color="blue" onClick={handleSubmit}>
                                    <Button.Content visible> Send</Button.Content>
                                    <Button.Content hidden>
                                        <Icon name='arrow right' />
                                    </Button.Content>
                                    </Button>
                                </div>
                            </>
                            :
                            <span className="noConversationText">Open a conversation to start chat.</span>
                        }
                    </div>
                    </Grid.Column>
                    <Grid.Column width={3} >
                        <div className="chatOnline">
                            <ChatOnline onlineUsers={onlineUsers} currentId={user.id} setCurrentChat={setCurrentChat}/>
                        </div>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
           
        </>
    )
}

export default Messenger
