import Link from 'next/link'
import { useSelector } from 'react-redux'
export default function Sidebar() {
    const userstate = useSelector((state) => state)
    return <aside className="al-sidebar" >
    <ul className="al-sidebar-list" >
        <li  className="al-sidebar-list-item">
            <Link href="/" >
                <a className="al-sidebar-list-link">
                    <i >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
</svg>
                    </i>
                    <span>Dashboard</span></a>
            </Link>
        </li>
        <li className="al-sidebar-list-item">
            <Link href="/orders" >
                <a className="al-sidebar-list-link">
                    
                <i>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
</svg>
</i>
                    <span>Orders</span></a>
            </Link>

        </li>
        <li className="al-sidebar-list-item">
            <Link href="/pages" >
                <a className="al-sidebar-list-link">
                    
                <i>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
</svg>
</i>
                    <span>Pages</span></a>
            </Link>

        </li>
        {userstate.modules.includes("c3m-lptpl-admin")&&
        <li className="al-sidebar-list-item">
            <Link href="/lptemplates" >
                <a className="al-sidebar-list-link">
                    
                <i>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
</svg>
</i>
                    <span>LPtemplate</span></a>
            </Link>

        </li>
}
        <li className="al-sidebar-list-item">
            <Link href="/logout" >
                <a className="al-sidebar-list-link">
                    
                <i>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
</svg>
</i>
                    <span>Logout</span></a>
            </Link>

        </li>
    </ul>
    <div className="sidebar-hover-elem"

         ></div>

    </aside>
  }