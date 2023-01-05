import { useEffect } from 'react';

import { useGame } from './hooks/useGame';
import { Modal } from './components/Modal';
import { FlagSvg } from './components/FlagSvg';
import bombSvg from './assets/bomb.svg';

import './App.scss';

function App() {
  const {
    data,
    init,
    handleFlag,
    handleOpen,
    bombsAmount,
    flagsAmount,
    isGameOver,
    isWinner,
  } = useGame();

  useEffect(() => {
    init();
  }, []);

  return (
    <main>
      <div className='container'>
        <h1>Minesweeper</h1>

        <section className='data'>
          <div>
            <span>Total Bombs: {bombsAmount}</span>
            <span>Flags: {flagsAmount}</span>
          </div>
        </section>

        <section className='game'>
          {data.map((row, rowIndex) => (
            <ul key={`row_${rowIndex}`}>
              {row.map((column, columnIndex) => (
                <li
                  key={`column_${columnIndex}`}
                  onClick={(event) =>
                    handleOpen({ event, rowIndex, columnIndex })
                  }
                  onContextMenu={(event) =>
                    handleFlag({ event, rowIndex, columnIndex })
                  }
                >
                  {!column.isOpen ? (
                    <span className='cover'>
                      {column.isFlagged && <FlagSvg className='flag' />}
                    </span>
                  ) : column.hasBomb ? (
                    <img src={bombSvg} alt='Bomb' />
                  ) : (
                    column.numberOfNearbyBombs > 0 && column.numberOfNearbyBombs
                  )}
                </li>
              ))}
            </ul>
          ))}
        </section>

        <div>right-click to place a flag</div>

        {isGameOver && (
          <Modal danger>
            <h2>Game Over</h2>

            <p>You lose, try again.</p>

            <button type='button' onClick={init}>
              Restart
            </button>
          </Modal>
        )}

        {isWinner && (
          <Modal>
            <h2>Congratulations!</h2>

            <button type='button' onClick={init}>
              Play again
            </button>
          </Modal>
        )}
      </div>
    </main>
  );
}

export default App;
