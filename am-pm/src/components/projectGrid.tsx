import React from "react";
import ProjectCard, { ProjectCardProps } from "./projectCard";
import "../styles/project-grid.css";

type Props = {
  projects: ProjectCardProps[];
};

const ProjectsGrid: React.FC<Props> = ({ projects }) => {
  return (
    <section className="p-grid-wrap" aria-label="Projects">
      <h2 className="project-title">Our Activities</h2>
      <div className="p-grid">
        {projects.map((p) => (
          <ProjectCard key={p.title + p.date} {...p} />
        ))}
      </div>
    </section>
  );
};

export default ProjectsGrid;
