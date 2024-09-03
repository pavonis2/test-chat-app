import Navbar from './Navbar'
import Search from './Search'

const Sidebar = () => {

  return (
    <div className='sidebar'>
      <Navbar />
      <div className='body'>
        <Search />
      </div>
    </div>
  )
}

export default Sidebar