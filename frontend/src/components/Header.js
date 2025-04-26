import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
    const [showHeader, setShowHeader] = useState(false);
    const [activeLink, setActiveLink] = useState(''); // State to track the active link

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowHeader(true);
        }, 100); // Delay to show the header

        return () => clearTimeout(timer); // Cleanup on unmount
    }, []);

    const handleLinkClick = (link) => {
        setActiveLink(link); // Set the clicked link as active
    };

    return (
        <header className={`header ${showHeader ? 'show' : ''}`}>
            <div className="header-container">
                <div className="logo">
                    <img src='./flogo.png' alt="Logo" className="logo-image" />
                </div>
                <nav className="navbar">
                    <ul className="nav-links">
                        <li>
                            <Link
                                to="/questionnaire"
                                className={activeLink === 'questionnaire' ? 'active' : ''}
                                onClick={() => handleLinkClick('questionnaire')}
                            >
                                Questionnaire
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/journal"
                                className={activeLink === 'journal' ? 'active' : ''}
                                onClick={() => handleLinkClick('journal')}
                            >
                                Journal
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/todolist"
                                className={activeLink === 'todolist' ? 'active' : ''}
                                onClick={() => handleLinkClick('todolist')}
                            >
                                To Do List
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;
