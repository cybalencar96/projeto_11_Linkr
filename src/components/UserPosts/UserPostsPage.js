import PageStyled from "../shared/PageStyled";
import { UserPostsContainer } from "./UserPostsStyled";
import { PageTitle } from '../shared/PageTitle';
import Card from "../shared/Card/Card";
import { useContext, useEffect, useState } from "react";
import { useParams, useHistory, useLocation } from "react-router-dom";
import UserContext from "../../contexts/UserContext";
import { 
    getListOfFollowingRequest,
    getPostsByUserId,
    sendFollowRequest,
    sendUnfollowRequest,
    getUser 
} from "../../services/Linkr";
import Loading, { CardLoadingScreen } from "../shared/Loading";
import HashtagsInTranding from "../shared/HashtagsInTranding/HashtagsInTranding";
import NoPosts from "../shared/NoPosts";
import YoutubeContext from "../../contexts/YoutubeContext";
import useWindowDimensions from "../../services/hooks/useWindowDimensions";
import SearchBar from "../shared/Topbar/SearchBar";
import { PublishButton } from "../shared/PublishLink/PostLink";
import FollowingContext from "../../contexts/FollowingContext";
import InfiniteScroll from "react-infinite-scroll-component";
import Swal from 'sweetalert2';

let page = 0;
let infinityScrollSetTimeout = null;

export default function UserPostsPage(props) {
    const { userData } = useContext(UserContext);
    const { listOfFollowing, setListOfFollowing } = useContext(FollowingContext)
    const [isLoading, setIsLoading] = useState(false);
    const [posts, setPosts] = useState("");
    const { id } = useParams();
    const history = useHistory();
    const {setYoutubeVideos} = useContext(YoutubeContext)
    const {windowWidth} = useWindowDimensions();
    const [isFollowing, setIsFollowing] = useState(false)
    const [user, setUser] = useState(null)
    const [hasNext, setHasNext] = useState(true);
    const location = useLocation();
    const username = location.state ? location.state.username : null;
    useEffect(() => {
        setYoutubeVideos([]);

        if (userData) {
            if (Number(id) === userData.user.id) {
                history.push("/my-posts")
            }
          
            clearTimeout(infinityScrollSetTimeout) //previne renderizar posts de outras paginas
            setIsFollowing(listOfFollowing.includes(Number(id)))
            renderPosts(true);
            getUserOwnerOfPage();
        }else if (userData === ""){
            history.push("/")
        }
    },[id,userData])

    function getUserOwnerOfPage() {
        if (!username) {
            getUser(id,userData.token)
            .then(res => setUser(res.data.user))
            .catch(err => {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Algo de errado ocorreu ao buscar esta pagina de usuário!! \n Redirecionando para timeline...',
                  })
                  console.log(err)
                  history.push('/')
            })
        }
    }
    
    function renderPosts(reload) {
        
        setIsLoading(true);

        if(reload){
            page = 0;
        }

        getPostsByUserId(id, userData.token, page)
        .then(res => {
            setIsLoading(false);

            if(!page){
                setPosts([]);
                setPosts(res.data.posts);
                setHasNext(true);
            }
            else{
                setPosts(posts.concat(res.data.posts));
            }            
            if(res.data.posts.length < 10){
                setHasNext(!hasNext);
            }
        })
        .catch(err => {
            setIsLoading(false);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Houve uma falha ao obter os posts, por favor atualize a página!',
              })
            history.push('/')
        })
    }

    function toggleFollow() {
        setIsLoading(true);
        if(isFollowing){
            sendUnfollowRequest(id, userData.token)
                .then(res => {
                    setIsFollowing(false);
                    setListOfFollowing(() => listOfFollowing.filter((listId) => listId != id))
                })
                .catch(err => {
                    console.log(err.response)
                })
                .finally(() => setIsLoading(false))
        }else{
            sendFollowRequest(id, userData.token)
                .then(res => {
                    setIsFollowing(true);
                    
                    setListOfFollowing([...listOfFollowing, Number(id)])
                })
                .catch(err => {})
                .finally(() => setIsLoading(false))
        }
    }

    function createButtonTxt() {
        if (isLoading === true)
            return "Loading...";
        return isFollowing ? "Unfollow" : "Follow";
    }

    if (!posts) {
        return <Loading />
    }

    const fetchMoreData = () => {
        infinityScrollSetTimeout = setTimeout(() => {
          page += 11;
          renderPosts();
        }, 2000);
    };

    return (
        <PageStyled centralized>
            <SearchBar display={windowWidth >= 992 ? "none" : "initial"}/>

            <UserPostsContainer>
                <PageTitle titleTxt={`${username ? username : (user && user.username) }'s posts`} >
                    <PublishButton disabled={isLoading} isWhite={isFollowing} onClick={toggleFollow} >
                        {createButtonTxt()}
                    </PublishButton>
                </PageTitle>
                <div className="content">
                    <div>
                        {posts.length !== 0 ? 
                        <InfiniteScroll
                        dataLength={posts.length}
                        next={fetchMoreData}
                        hasMore={hasNext}
                        loader={CardLoadingScreen()}
                        > 
                        {posts.map(post => <Card post={post} key={post.id} renderPosts={renderPosts} />)}
                        </InfiniteScroll> : <NoPosts />}
                    </div>
                    <HashtagsInTranding setIsLoading={setIsLoading} />
                </div>
            </UserPostsContainer>
        </PageStyled>
    )
}