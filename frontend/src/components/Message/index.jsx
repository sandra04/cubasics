import styled from 'styled-components'

import { InteractionFalseLink } from '../../utils/styles/Atoms'



const MessageInfos = styled.div`  
    margin-bottom:40px;
    font-weight:700;
    color:#565656;
`

const MessageContent = styled.div`
    font-style:italic;
`


function Message({ id, content, image, date, modifiedDate, seen, user, isSender, setModifyingMessage, setMessageToModify, setAskingDeleteMessage, setMessageToDelete }){

    function handleModifyMessage(messageId, messageContent, messageImage){
        setMessageToModify({id: messageId, content: messageContent, image: messageImage })
        setModifyingMessage(true)
    }
    function handleDeleteMessage(messageId){
        setAskingDeleteMessage(true)
        setMessageToDelete(messageId)
    }
    
    let formattedContent = content?.split("\r\n")
    formattedContent = content?.split("\n")

    return(
        <div>
            {isSender ? <div style={{backgroundColor:"#ffffff", width:"80%", margin:"0 0 30px 20%", padding:"30px"}}>
                <MessageInfos>
                    <p className="sender-presentation">Envoyé par vous, le {date}</p>
                    {modifiedDate && <p className="sender-presentation" style={{fontWeight:500}}>(Modifié le {modifiedDate})</p>}
                </MessageInfos>
                <MessageContent className="sender-content">
                    {formattedContent.map((phrase, index) => <p key={index}>{phrase}</p>)}
                    {image && <div style={{display:"flex", flewWrap:"wrap", width:"100%", justifyContent:"space-between"}}>
                            {JSON.parse(image).map((currentImage, index) => <img key={index} src={`/api/${currentImage}`} alt="" style={{width:"100%", maxWidth:"400px", marginBottom:"30px"}}/>)}
                        </div>}
                        {isSender &&
                            <div style={ {display:"flex", flexWrap:"wrap", marginTop:"30px"} }>
                            <InteractionFalseLink onClick={() => handleModifyMessage(id, content, image)} style={{marginRight:"20px", marginTop:"12px"}}>Modifier le message</InteractionFalseLink>
                            <InteractionFalseLink onClick={()=> handleDeleteMessage(id)}>Supprimer le message</InteractionFalseLink>
                        </div>}
                </MessageContent>
            </div> :
            <div style={{backgroundColor:"#ffffff", width:"80%", margin:"0 0 30px 0", padding:"30px"}}>
                <MessageInfos>
                    <p>Envoyé par {user}, le {date}</p>
                    {modifiedDate && <p style={{fontWeight:500}}>(Modifié le {modifiedDate})</p>}
                </MessageInfos>
                <MessageContent>
                    {formattedContent.map((phrase, index) => <p key={index}>{phrase}</p>)}
                </MessageContent>
            </div>}
        </div>
    )
}

export default Message