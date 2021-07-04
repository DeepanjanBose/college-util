import React, { useEffect, useState } from 'react';
import {Card, Table, Header, Label, Modal, Form, Icon} from 'semantic-ui-react';
import axios from "axios";
import AdminLoader from './AdminLoader';
import Select from 'react-select';


export default function UserList() {

    const [usersList, setUsersList] = useState(null);
    const [showLoader, toggleLoader] = useState(true)
    const [error, setError] = useState(false);
    const [modalData, setModalData] =  useState(null);
    const [disabledButton, setDisabledButton] = useState(false);



    //default values

    const roleOption = [
        {label: 'ADMIN', value: 'ADMIN'},
        {label: 'PLACEMENT_CELL', value: 'PLACEMENT_CELL'},
        {label: 'EXAM_CELL', value: 'EXAM_CELL'},
        {label: 'CULTURAL_CELL', value: 'CULTURAL_CELL'},
        {label: 'SPORTS_CELL', value: 'SPORTS_CELL'},
        {label: 'NSS_CELL', value: 'NSS_CELL'},
        {label: 'MAR_CELL', value: 'MAR_CELL'},
    ]

    const statusColor = {
        pending: "yellow",
        banned: "red",
        active: "green",
        inactive: "grey"
    }

    let month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul","Aug", "Sep", "Oct", "Nov", "Dec"];

    function pad(n) {
        return n < 10 ? "0"+n : n;
    }

    function getDate(date){
        let dateObject = new Date(date);
        return pad(dateObject.getDate())+" "+ month[dateObject.getMonth()] +" "+dateObject.getFullYear();
    }


    ///////////

    const reverseUserList = () => {
        console.log('clicked', usersList)
        setUsersList([...usersList].reverse());
    }

    const getUserList = (componentStatus) =>{
        axios.get('http://localhost:5000/cms/userList',{withCredentials: true})
        .then(res=>{
            if(res.status === 200){
                return res.data;
            }else{
               
                throw Error('Error fetching data');
            }
        })
        .then(result=>{
            //console.log(result);

            //if component is unmounted donot update states
            if(!componentStatus.isMounted)
                return;


            //check for status
            if(result.response_status === 1000){
                setUsersList(result.response_data);
                toggleLoader(false)
            }
            else if(result.response_status === 1001 || result.response_status === 1002){
                throw Error(result.message);
            }else {
                console.log(result);
                throw Error('Error, check console for more');
            }
        }).catch(err=>{
            console.log(err);

            if(!componentStatus.isMounted)
                return;

            setError(err.message);
            toggleLoader(false);
        })
    }

    const updateUserStatusANDRole = (e) =>{
        //update data
        setDisabledButton(true);

        axios.post('http://localhost:5000/cms/updateUserList', {
            _id: modalData._id,
            email: modalData.email,
            role: modalData.role,
            isAllowed: modalData.isAllowed
        }, {withCredentials: true})
        .then(res=>{
            if(res.status === 200){
                return res.data;
            }else{
                setDisabledButton(false);
                alert('Error fetching data');
            }
            return false;
        })
        .then(result=>{

            console.log(result);
            if(!result)
                return;

            if(result.response_status === 1000){
                //update existing user list
                let updatedUserList = usersList.map((user, index)=>{
                    if(user._id===modalData._id){
                        user.role = modalData.role;
                        user.isAllowed = modalData.isAllowed;
                    }
                    return user;
                })
                
                setUsersList(updatedUserList);
                setModalData(null);
                alert('Updated');
            }
            else if(result.response_status === 1001 || result.response_status === 1002){
                alert(result.message);
            }else {
                console.log(result);
                alert('Error, check console for more');
            }
            setDisabledButton(false);
        })
        .catch(err=>{
            console.log(err);
            alert(err.message);
            setDisabledButton(false)
        })


        //if all good 
        //toggleDisabledButton(false)
    }

    useEffect(() => {
        let componentStatus = {
            isMounted: true
        };
        //get user data from server.
        getUserList(componentStatus);

        return ()=>{
            componentStatus.isMounted = false;
        };

    }, [])


    if(error){
        return (
            <div>
                {error}
            </div>
        )
    }

    if(showLoader)
        return (
            <AdminLoader />
        )

    return (
        <div>   

            {modalData && <Modal open={modalData?true:false} onClose={()=>setModalData(null)} size='small' style={{padding: '20px 30px'}} closeOnDimmerClick={false}>
                <div>
                    <Table basic celled>
                        <Table.Body>
                        <Table.Row>
                            <Table.Cell>Name</Table.Cell>
                            <Table.Cell>{modalData.name}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>Email</Table.Cell>
                            <Table.Cell>{modalData.email}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>Joined</Table.Cell>
                            <Table.Cell>{getDate(modalData.date_created)}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>status</Table.Cell>
                            <Table.Cell>
                                <Form.Field control='select' name="status" onChange={(e)=>setModalData({...modalData, isAllowed: e.target.value})}>
                                    {Object.keys(statusColor).map((status, index) =>(
                                            <option value={status} key={index} selected={status===modalData.isAllowed?true:false}>{status}</option>
                                    ))}

                                </Form.Field>
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>Role</Table.Cell>
                            <Table.Cell style={{width: 600}}>
                                <Select options={roleOption} value={modalData.role.map(role=>{return {label: role, value: role}})} isMulti isClearable={false} onChange={(roles, actionType)=>{

                                    if(actionType.action === 'remove-value' && roles.length > 0){
                                        
                                        let updatedRoles = modalData.role.filter(role=>{
                                            return actionType.removedValue.label!==role;
                                        });
                                        setModalData({...modalData, role: updatedRoles});
                                    }
                                    else if(actionType.action === 'select-option'){
                                        setModalData({...modalData, role: [...modalData.role, actionType.option.label]})
                                    }
                                }}
                                />
                            </Table.Cell>
                        </Table.Row>
                        </Table.Body>
                    </Table>
                    <div style={{textAlign: "right"}}>
                        <button className="ui red button" disabled={disabledButton} onClick={()=>setModalData(null)}> Cancel </button>
                        <button className={"ui green button" + (disabledButton?" loading": "")} disabled={disabledButton}  onClick={updateUserStatusANDRole}> Save Changes </button>
                    </div>
                </div>
            </Modal>
            }

            <Card className="user-list-card">
                <Card.Content>

                    <Card.Header>Users
                    <Icon name='sort' style={{marginLeft: '10px', cursor: 'pointer'}} onClick={reverseUserList}/>
                    </Card.Header>
                    
                </Card.Content>
                <Card.Content>
                    <Table basic='very' striped selectable>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Name</Table.HeaderCell>
                                <Table.HeaderCell>Email</Table.HeaderCell>
                                <Table.HeaderCell>Registered</Table.HeaderCell>
                                <Table.HeaderCell>Role</Table.HeaderCell>
                                <Table.HeaderCell>Status</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body style={{cursor: "pointer"}}>
                            {
                                usersList.map(user=>(
                                    <Table.Row key={user._id} className="userlist-hover" onClick={()=>{setModalData(user)}}>
                                        <Table.Cell>
                                        <Header as='h4'>
                                            <Header.Content className="user-list-table-hContent">
                                            {user.name}
                                            </Header.Content>
                                        </Header>
                                        </Table.Cell>
                                        <Table.Cell>{user.email}</Table.Cell>
                                        <Table.Cell>{getDate(user.date_created)}</Table.Cell>
                                        {/*<Table.Cell singleLine={false}>{user.role.map((role, index)=>(user.role.length - 1 === index? role: role + " | "))}</Table.Cell> */}
                                        <Table.Cell singleLine={false}>
                                            {user.role.join(" | ")}
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Label color={statusColor[user.isAllowed]}
                                            content={user.isAllowed}
                                            size="mini"
                                            />
                                            
                                        </Table.Cell>
                                    </Table.Row>
                                ))
                            }
                            {/* <Table.Row>
                                <Table.Cell>
                                <Header as='h4'>
                                    <Header.Content className="user-list-table-hContent">
                                    Some Name
                                    </Header.Content>
                                </Header>
                                </Table.Cell>
                                <Table.Cell>someone@gmail.com</Table.Cell>
                                <Table.Cell>01-01-2021</Table.Cell>
                                <Table.Cell>EXAM_CELL</Table.Cell>
                                <Table.Cell>
                                    <Label      color="yellow"
                                    content="pending"
                                    size="mini"
                                    />
                                    
                                </Table.Cell>
                            </Table.Row>

                            <Table.Row>
                                <Table.Cell>
                                <Header as='h4'>
                                    <Header.Content className="user-list-table-hContent">
                                    Some Name2
                                    </Header.Content>
                                </Header>
                                </Table.Cell>
                                <Table.Cell>someone2@gmail.com</Table.Cell>
                                <Table.Cell>01-01-2021</Table.Cell>
                                <Table.Cell>EXAM_CELL</Table.Cell>
                                <Table.Cell>
                                    <Label      color="red"
                                    content="banned"
                                    size="mini"
                                    />
                                    
                                </Table.Cell>
                            </Table.Row>

                            <Table.Row>
                                <Table.Cell>
                                <Header as='h4'>
                                    <Header.Content className="user-list-table-hContent">
                                    Some Name3
                                    </Header.Content>
                                </Header>
                                </Table.Cell>
                                <Table.Cell>someone3@gmail.com</Table.Cell>
                                <Table.Cell>01-01-2021</Table.Cell>
                                <Table.Cell>EXAM_CELL</Table.Cell>
                                <Table.Cell>
                                    <Label      color="grey"
                                    content="inactive"
                                    size="mini"
                                    />
                                    
                                </Table.Cell>
                            </Table.Row>

                            <Table.Row>
                                <Table.Cell>
                                <Header as='h4'>
                                    <Header.Content className="user-list-table-hContent">
                                    Some Name4
                                    </Header.Content>
                                </Header>
                                </Table.Cell>
                                <Table.Cell>someone4@gmail.com</Table.Cell>
                                <Table.Cell>01-01-2021</Table.Cell>
                                <Table.Cell>EXAM_CELL</Table.Cell>
                                <Table.Cell>
                                    <Label      color="green"
                                    content="active"
                                    size="mini"
                                    />
                                    
                                </Table.Cell>
                            </Table.Row> */}


                        </Table.Body>
                    </Table>
                </Card.Content>
            </Card>
        </div>
    )
}
