import { CardContainer, LinkContent, CardRigth, CardLeft } from "./CardStyled";
import { Heart, HeartOutline } from 'react-ionicons'
import UserImage from "../UserImage";
import HashtagSpan from "../HashtagSpan";
import { Link } from 'react-router-dom'
import { useContext, useState } from "react";
import UserContext from "../../../contexts/UserContext";
import { sendDislikeRequest, sendLikeRequest, sendDeletePostRequest} from "../../../services/Linkr";
import ReactTooltip from "react-tooltip";
import {FaTrash} from "react-icons/fa";
import {RiPencilFill} from "react-icons/ri";
import styled from "styled-components";

export default function Card({post,renderPosts}) {
    const {
        commentCount,
        id,
        likes,
        link,
        linkDescription,
        linkImage,
        linkTitle,
        text,
        user
    } = post
    const [ likesState, setLikesState] = useState(likes.map(like => {
        return {
            userId: like.userId,
            username: like["user.username"]
        }
    }));
    const [ isLoading, setIsLoading] = useState(false)
    const { userData} = useContext(UserContext);
    const isLiked = isLoading !== likesState.map(like => like.userId).includes(userData.user.id);
    const [ConfirmDeleteState, setConfirmDeleteState] = useState(false); 
    function renderDescription() {
        const formatedText = text.split(" ").map(word => {
            if (word[0] === "#") {
                return <Link to={`/hashtag/${word.substring(1)}`}><HashtagSpan> #{word.substring(1)}</HashtagSpan></Link>
            } else {
                return " " + word
            }
        })
        return formatedText
    }
    function toggleLike () {
        if (isLoading){
            return;
        }
        setIsLoading(true)
        if(isLiked){
            sendDislikeRequest(id, userData.token)
                .then(res => {
                    setLikesState(res.data.post.likes)
                })
                .catch(err => alert(err))
                .finally(() => setIsLoading(false))
        }else{
            sendLikeRequest(id, userData.token)
                .then(res => {
                    setLikesState(res.data.post.likes)
                })
                .catch(err => alert(err))
                .finally(() => setIsLoading(false))
        }
    }
    function createTooltip(){
        let tooltip = "";
        const likesiDsList = likesState.map(like => like.userId)
        const isLikedOnServer = likesiDsList.includes(userData.user.id);
        if(isLikedOnServer){
            const indexOfUser = likesiDsList.indexOf(userData.user.id);
            const OtherUsers = likesState.map((like, i) => i === indexOfUser ? null : like.username)
                .filter((username) => !!username);
            tooltip += `Você`;
            if(likesState.length > 1){
                tooltip += `, ${OtherUsers[0]}`;
            }
        }else{
            if(likesState.length > 0){
                tooltip += likesState[0].username;
            }
            if(likesState.length > 1){
                tooltip += `, ${likesState[1].username}`;
            }
        }
        if(likesState.length > 2){
            tooltip += ` e outras ${likesState.length - 2} ${likesState.length === 3 ? "pessoa" : "pessoas"}`;
        }
        return tooltip;
    }

    function deletePost(postId) {
        setIsLoading(true);
        sendDeletePostRequest(postId, userData.token)
          .then(() => {
            setIsLoading(false);
            setConfirmDeleteState(false);
            renderPosts();
          })
          .catch(() => {
            setIsLoading(false);
            setTimeout(() => {
              alert(
                "Could not delete your post! Please repeat the procedure."
              );
            }, 900);
            setConfirmDeleteState(false);
          });
      }
    
    return (
        <>
        <Superposition ConfirmDeleteState={ConfirmDeleteState}>
            <ConfirmDeleteScreen>
                <p>Tem certeza que deseja <br/> excluir essa publicação?</p>
                <SuperpositionButtons>
                    <CancelButton disabled={isLoading ? true : false} onClick={() => setConfirmDeleteState(false)}>
                        Não, voltar
                    </CancelButton>
                    <ConfirmButton disabled={isLoading ? true : false} onClick={() => deletePost(id)}>
                        {isLoading ? "Excluindo..." : "Sim, excluir"}
                    </ConfirmButton>
                </SuperpositionButtons>
            </ConfirmDeleteScreen>
        </Superposition>
        <CardContainer>
            <CardLeft>
                <Link to={`/user/${user.id}`}>
                    <UserImage src={user.avatar}/>
                </Link>
                {isLiked ? <Heart color={'#AC0000'} height="30px" width="30px" onClick={toggleLike} style={{cursor: 'pointer'}} /> :
                 <HeartOutline color={'#00000'} height="30px" width="30px" onClick={toggleLike} style={{cursor: 'pointer'}}/>}
                <p data-tip={createTooltip()}>{likesState.length} likes</p>
                <ReactTooltip place="bottom" type="light" effect="solid"/>
            </CardLeft>

            <CardRigth>
                { userData.user.id !== user.id ? <IconsDiv><Link to={userData.user.id !== user.id ? `/user/${user.id}` : `/my-posts/`}>
                    <h3 className="username">{user.username}</h3>
                </Link></IconsDiv> :
                <IconsDiv>
                <Link to={userData.user.id !== user.id ? `/user/${user.id}` : `/my-posts/`}>
                    <h3 className="username">{user.username}</h3>
                </Link>
                <div>
                    <IconEdit />
                    <IconDelete onClick={() => setConfirmDeleteState(true)}/>
                </div>
                </IconsDiv>}
                <p className="description">{renderDescription()}</p>
                
                <a href={link}>
                    <LinkContent>
                        <div className="linkContent">
                            <h3 className="linkTitle">{linkTitle}</h3>
                            <p className="linkDescription">{linkDescription}</p>
                            <p className="linkUrl">{link}</p>
                        </div>
                        <img src={linkImage}/>
                    </LinkContent>
                </a>
            </CardRigth>
        </CardContainer>
        </>
    )
}

const IconDelete = styled(FaTrash)`
    margin-left: 25px;
    &:hover{
        color: red;
    }
`;

const IconEdit = styled(RiPencilFill)`
    &:hover{
        color: green;
    }
`;

const IconsDiv = styled.div`
    width: 90%;
    display: flex;
    justify-content: space-between;
`;

const Superposition = styled.div`
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 1;
  display: ${(props) => (props.ConfirmDeleteState ? "inherit" : "none")};
`;

const ConfirmDeleteScreen = styled.div`
  position: relative;
  top: calc((100vh - 262px) / 2);
  left: calc((100vw - 597px) / 2);
  width: 597px;
  height: 262px;
  border-radius: 50px;
  background-color: #333333;
  font-family: "Lato", sans-serif;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  p {
    text-align: center;
    font-weight: bold;
    font-size: 34px;
    color: #ffffff;
    margin-bottom: 40px;
  }

  @media (max-width: 994px) {
    width: 100%;
    left: 0;
    border-radius: 0;
  }
`;

const SuperpositionButtons = styled.div`
  font-size: 18px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
`;

const CancelButton = styled.button`
  background-color: #ffffff;
  color: #1877f2;
  line-height: 22px;
  width: 134px;
  height: 37px;
  border-radius: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 27px;

  &:hover {
    cursor: pointer;
    border: 5px solid #1877f2;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ConfirmButton = styled.button`
  background-color: #1877f2;
  color: #ffffff;
  line-height: 22px;
  width: 134px;
  height: 37px;
  border-radius: 5px;
  display: flex;
  justify-content: center;
  align-items: center;

  &:hover {
    cursor: pointer;
    border: 5px solid crimson;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;