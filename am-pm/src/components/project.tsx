import Header from "./header";
import '../styles/project.css';
import React, {useEffect, useState} from "react";

type ProjectType = {
  id: number;
  title: string;
  year: number;
  image: string;
  description: string;
};

function Project() {
    const [projects,setProjects]=useState<ProjectType[]>([]);
    const [selectedYear,setSelectedYear]=useState<number | "all">("all");

    useEffect(()=>{
        fetch("/project.json")
        .then(res=>res.json())
        .then(data=>setProjects(data))
        .catch(err=>console.error("Error fetching data:",err));
    },[]);

    const year = Array.from(new Set(projects.map(p=>p.year))).sort((a,b)=>b-a);

    const filteredProjects = selectedYear==="all"?projects:projects.filter(p=>p.year===selectedYear);

    return (
        <>
        <Header />
        <div className="project-title-group">
            <div className="project-title">프로젝트</div>
            <div className="project-subtitle">지금까지 진행한 프로젝트들을 구경해보세요!</div>
        </div>
        <div>
            {projects.map(project=>(
                <div key={project.id}>{project.title}</div>
            ))}
        </div>
        <div className="filter-bar">
            <button className={`pill-btn ${selectedYear==="all"?"active":""}`} onClick={()=>setSelectedYear("all")}>전체</button>
            {year.map(year=>(<button key={year} className={`pill-btn ${selectedYear===year?"active":""}`} onClick={()=>setSelectedYear(year)}>{year}</button>))}
        </div>
            <div className="project-list">
        {filteredProjects.map(project => (
          <div key={project.id} className="project-card">
            <img src={project.image} alt={project.title} className="project-image" />
            <div className="project-card-title">{project.title}</div>
            <div className="project-desc">{project.description}</div>
          </div>
        ))}
      </div>
        </>
        
    );
}

export default Project;