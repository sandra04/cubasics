import React from 'react';
import ReactDOM from 'react-dom/client';

// on renomme BrowserRouter en "Router" pour plus de facilité
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './utils/styles/index.css';

import Header from './components/Header'
import Error from './components/Error'
import ScrollToTop from './components/ScrollToTop'

import Home from './pages/Home'
import Connexion from './pages/Connexion'
import Profile from './pages/Profile'
import UserProfile from './pages/UserProfile'
import UserPosts from './pages/UserPosts'
import UserProjects from './pages/UserProjects'
import UserFavorites from './pages/UserFavorites'
import UserComments from './pages/UserComments'
import Messages from './pages/UserMessages'
import Contacts from './pages/UserContacts'
import Inscription from './pages/Inscription'
import Posts from './pages/Posts'
import Post from './pages/Post'
import NewPost from './pages/NewPost'
import Projects from './pages/Projets'
import Project from './pages/Projet'
import NewProject from './pages/NewProject'


// On importe les providers de nos contextes
import { UserStatusProvider, ActiveConversationProvider } from './utils/context';



const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Router>
      <UserStatusProvider>
        <ActiveConversationProvider>
          <Header/>
          <ScrollToTop/>
          <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/connexion" element={<Connexion/>} />
            <Route path="/profile" element={<UserProfile/>} />
            <Route path="/profile/:userAsked" element={<Profile/>} />
            <Route path="/user_posts" element={<UserPosts/>} />
            <Route path="/user_projects" element={<UserProjects/>} />
            <Route path="/user_favorites" element={<UserFavorites/>} />
            <Route path="/user_comments" element={<UserComments/>} />
            <Route path="/contacts" element={<Contacts/>} />
            <Route path="/messages" element={<Messages/>} />
            <Route path="/inscription" element={<Inscription/>} />
            <Route path="/posts" element={ <Posts/> } />
            <Route path="/post/:id" element={<Post/>} />
            <Route path="/new_post" element={ <NewPost/>} />
            <Route path="/projets" element={ <Projects/> } />
            <Route path="/projet/:id" element={<Project/>} />
            <Route path="/new_project" element={<NewProject/>} />
            <Route path="*" element={<Error/>} />
          </Routes>
        </ActiveConversationProvider>
      </UserStatusProvider>
    </Router>
  </React.StrictMode>
)
