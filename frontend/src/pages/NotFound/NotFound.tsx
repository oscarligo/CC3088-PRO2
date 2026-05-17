import './NotFound.css'
import PageHeader from '../../components/PageHeader/PageHeader'

export default function NotFound() {
    return (
        <div className="notFoundPage pageFrame">
            <PageHeader title="404 - Página no encontrada" description="Lo sentimos, la página que buscas no existe." />
        </div>
    )       
}