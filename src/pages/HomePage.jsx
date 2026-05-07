import { useEffect, useState } from 'react'
import { DarkModeToggle } from "../components/DarkModeToggle";

const HomePage = () => {
    const [data, setData] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch('data/index.json')
            const jsonData = await response.json()
            setData(jsonData)
        }

        fetchData()
    }, [])

    return (
        <>

            <h1 className="text-3xl font-bold underline">HomePage</h1>
            <DarkModeToggle />
            {data && data.length > 0 ? (
                <div>
                    {data.map((item) => (
                        <p key={item.task} className='text-blue-500'>Task {item.task}: {item.url}</p>
                    ))}
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </>
    )
}

export default HomePage