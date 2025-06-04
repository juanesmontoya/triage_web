import React from 'react'
import Navbar from '../components/Navbar'
import Banner from '../components/Banner'
import Footer from '../components/Footer'
import InfoSection from '../components/InfoSection'

function Home({ darkMode = false, setDarkMode = () => { } }) {
  return (
    <>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <div className="pt-20 px-4 md:px-20 bg-base-200">
        <InfoSection />
      </div>
      <div className="px-4 md:px-20 bg-base-100 -mt-20">
        <Banner />
      </div>
    </>
  )
}

export default Home
