import React, { useState, useEffect } from 'react';
import { Card, Grid ,Button, Modal} from 'semantic-ui-react';
import axios from "axios";
import AdminLoader from './AdminLoader';
import fileDownload from 'js-file-download';
import Messenger from './messenger/Messenger';

export default function Default() {

    const [recentFiles, setRecentFiles] = useState([]);
    const [myRecentFiles, setMyRecentFiles] = useState([]);
    const [showLoader, toggleLoader] = useState(true);
    const [disabledButton, setDisabledButton] = useState(false);
    const [open, setOpen] = useState(false);


    const getDayCount = (createdAt) =>{
        let dt = ((new Date() - new Date(createdAt))/864e5|0)
        if(dt===0)
            return 'Today';
        else if(dt===1)
        return dt + ' day ago';
        else
        return dt + ' days ago';
    }


    const getRecentFiles = async ( reqFile, componentStatus) =>{
        try{  
            const {data} = await axios.get('http://localhost:5000/files/getrecentfiles/'+ reqFile, {withCredentials: true});

            if(!componentStatus.isMounted)
                return;

            if(data.response_status === 1000){
                reqFile==="myRecent"?setMyRecentFiles(data.response_data):setRecentFiles(data.response_data);
                toggleLoader(false);
                console.log(data.response_data)
            }
            else if(data.response_status === 1001 || data.response_status === 1002){
                throw Error(reqFile+': '+data.message);
            }else {
                console.log(data);
                throw Error(reqFile + ': Error, check console for more');
            }

        }catch(e){
            console.log(e);
            toggleLoader(false);
            alert(e.message);
        }
    }

    const deleteFile = (fileId) => {
        if(disabledButton)
            return alert('wait file deleting...');
        setDisabledButton(true);
        axios.post('http://localhost:5000/files/deletefile',{
            id: fileId
        }, {withCredentials: true})
        .then(res=>{
            if(res.status === 200){
                return res.data;
            }else{
                setDisabledButton(false);
                alert('Error getting data');
            }
            console.log(res);
            return false;
        })
        .then(result=>{
            console.log(result);
            if(!result)
                return;
            if(result.response_status === 1000){
                setDisabledButton(false);
                //update existing user list
                let updatedFileList = myRecentFiles.filter((file)=>file._id !== fileId)
                setMyRecentFiles(updatedFileList);

                updatedFileList = recentFiles.filter((file)=>file._id !==fileId);
                setRecentFiles(updatedFileList);

            }
            else if(result.response_status === 1001 || result.response_status === 1002){
                alert(result.message);
            }else {
                console.log(result);
                alert('ERROR: CHECK CONSOLE FOR DETAILS');
            }
            setDisabledButton(false);
        })
        .catch(err=>{setDisabledButton(false); console.log(err); alert(err.message)})
    }


    const downloadFile = (fileId, title, path) =>{
        axios.post('http://localhost:5000/files/downloadfile',{id: fileId}, {responseType: 'blob', withCredentials: true})
        .then(res=>{
            
            if(res.status === 200){
                console.log(res, res.data, res.headers['content-type'], res.data.type);
                //console.log(JSON.parse(res.data))
                if(res.data.type.match(/json/gi))
                {
                    // console.log(res.data.text())
                    return new Promise((resolve, reject)=>{
                        res.data.text()
                        .then(text=>resolve(JSON.parse(text)))
                        .catch(err=>reject({response_status: 1002, message: 'Error converting to text data'}));
                    });
                }
                 else   
                    return res.data;
            }else{
               // setDisabledButton(false);
               console.log(res.status)
                alert('Error getting data');
                return false;
            };
        })
        .then(result=>{
            
            if(!result)
                return;
            
            // if(result.response_status === 1000){
            //     //setDisabledButton(false);
            //     //update existing user list
            //     fileDownload(result.response_data, result.fileName);
            // }
            if(result.response_status === 1001 || result.response_status === 1002){
               return alert(result.message);
            }
            let pathSplit = path.split('/');
            let fileExtension = pathSplit[pathSplit.length - 1];

            //download(result.response_data, title + fileExtension);
            fileDownload(result, title+fileExtension);
            setDisabledButton(false);
        })
        .catch(err=>{ console.log(err); alert(err.message)})

    }

    useEffect(() => {
        let componentStatus = {
            isMounted: true
        };
        
        //get user data from server.
        getRecentFiles('myRecent', componentStatus);
        getRecentFiles('all', componentStatus);

        return ()=>{
            componentStatus.isMounted = false;
        };

    }, [])


    if(showLoader){
        return <AdminLoader/>
    }

    return (
        <div>
            {
                open ? 
                (<Modal
                    onClose={() => setOpen(false)}
                    onOpen={() => setOpen(true)}
                    open={open}
                  >
                    <Modal.Header>Chat</Modal.Header>
                    <Modal.Content>
                      <Messenger/>
                    </Modal.Content>
                    {/* <Modal.Actions>
                      <Button color='black' onClick={() => setOpen(false)}>
                        Nope
                      </Button>
                      <Button
                        content="Yep, that's me"
                        labelPosition='right'
                        icon='checkmark'
                        onClick={() => setOpen(false)}
                        positive
                      />
                    </Modal.Actions> */}
                  </Modal>
                )
                :
                (        
                <div>
                    <Grid columns="equal" padded="vertically" >
                        <Grid.Row centered>
                            <Grid.Column width={6}>
                                <Card fluid>
                                    <Card.Content>
                                        <Card.Header>Recent Uploads</Card.Header>
                                    </Card.Content>
                                    <Card.Content>
                                        {recentFiles.length!==0?(
                                            recentFiles.map((file, index)=>
                                                index>2?(<></>):
                                                <Card fluid key={file._id}>
                                                    <Card.Content>
                                                        <Card.Header>
                                                            {file.title.length > 30 ? file.title.substring(0, 30) + '...' : file.title}
                                                        </Card.Header>
                                                        <Card.Meta>
                                                            <i><b>By </b>{ file.uploadedBy?.email}</i> <small>{getDayCount(file.ctreatedAt)}</small>
                                                        </Card.Meta>
                                                        <Card.Meta>{file.uploadedUnder}</Card.Meta>
                                                        <Card.Description>
                                                            {file.description.length > 40 ? file.description.substring(0, 44) + '...' : file.description}
                                                        </Card.Description>
                                                    </Card.Content>
                                                    <div className="ui bottom attached button primary" onClick={()=>downloadFile(file._id, file.title, file.file_path)}>
                                                        <i className="download icon"></i>
                                                        Download
                                                    </div>
                                                </Card>
                                            )
                                        ):(
                                            <NoDataAvailable text="No Record Found"/>
                                        )}
                                        
                                    </Card.Content>
                                </Card>
                            </Grid.Column>
                            <Grid.Column width={8}>
                                <Card fluid>
                                    <Card.Content>
                                        <Card.Header>My Uploads</Card.Header>
                                    </Card.Content>
                                    <Card.Content>
                                        {/* <NoDataAvailable text="No Record Found"/> */}
                                        {myRecentFiles.length!==0?(
                                            myRecentFiles.map((file, index)=>
                                                    index>2?(<></>):
                                                <Card fluid key={file._id}>
                                                    <Card.Content>
                                                        <Card.Header>
                                                            {file.title.length > 40 ? file.title.substring(0, 45) + '...' : file.title}
                                                        </Card.Header>
                                                        <Card.Meta>
                                                            <i><b>By </b>{file.uploadedBy?.email}</i> <small>{getDayCount(file.createdAt)}</small>
                                                        </Card.Meta>
                                                        <Card.Meta>{file.uploadedUnder}</Card.Meta>
                                                        <Card.Description>
                                                            {file.description.length > 50 ? file.description.substring(0, 65) + '...' : file.description}
                                                        </Card.Description>
                                                    </Card.Content>
                                                    <div className="ui two buttons attached">
                                                        <div className="ui bottom attached button primary" onClick={()=>downloadFile(file._id, file.title, file.file_path)}>
                                                            <i className="download icon"></i>
                                                            Download
                                                        </div>
                                                        <div class="ui bottom attached button negative" onClick={(e)=>deleteFile(file._id)}>
                                                            <i className="remove icon"></i>
                                                            Delete
                                                        </div>
                                                    </div>
                                                </Card>
                                            )
                                        ):(
                                            <NoDataAvailable text="No Record Found"/>
                                        )}
                                        
                                    </Card.Content>
                                </Card>
                            </Grid.Column>
                            </Grid.Row>
                            <Grid.Row centered>
                                <Grid.Column textAlign="right" width={15}>
                                <Button circular size="huge" color='facebook' icon='comment alternate' onClick={()=>{setOpen(true)}}/>
                                </Grid.Column>
                            </Grid.Row>
                    </Grid>
                </div>
                )
            }
       </div>
    )
}

function NoDataAvailable ({text}) {
    return(
        <div style={{display: 'flex',minHeight: '250px', justifyContent: "center", alignItems: "center"}}>
            <h5>{text}</h5>
        </div>
    )
}