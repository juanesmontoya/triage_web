import React from 'react'
import Navbar from '../components/Navbar'
import Banner from '../components/Banner'
import Footer from '../components/Footer'

function Home({ darkMode = false, setDarkMode = () => {} }) {
  return (
  <>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode}/>
      <Banner />
      <Footer />
  </>
  )
}

export default Home
