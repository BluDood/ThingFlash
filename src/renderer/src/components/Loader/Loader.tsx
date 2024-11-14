import styles from './Loader.module.css'

interface LoaderProps {
  size?: number
}

const Loader: React.FC<LoaderProps> = ({ size = 32 }) => {
  return <div className={styles.loader} style={{ width: size }} />
}

export default Loader
