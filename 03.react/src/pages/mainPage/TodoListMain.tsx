import TodoUpdate from '../../component/updatePage/TodoUpdate';
import { getTodoList, deleteTodoItem, patchTodoItem } from '../../API/axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

export const TodoListMain = () => {
  const [data, setData] = useState<TodoItem[]>([]);
  const [sortByDate, setSortByDate] = useState<'asc' | 'desc'>('asc');
  const [toggle, setToggle] = useState<{ [key: number]: boolean }>({});
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [filterByDone, setFilterByDone] = useState<boolean | null>(null); // 추가

  const navigate = useNavigate();

  const moveToRegist = () => {
    navigate('/regist');
  };

  const deleteAllTodo = async () => {
    data?.forEach((item) => deleteTodoItem(item._id));
    getData();
  };

  const getData = async () => {
    const response = await getTodoList();
    setData(response.data.items.reverse());
  };

  useEffect(() => {
    getData();
  }, []);

  const showTodoDetail = async (id: number) => {
    setToggle((prev) => {
      const newToggle = { ...prev };
      newToggle[id] = !newToggle[id];
      return newToggle;
    });
  };

  const checkTodoDone = async (item: TodoItem) => {
    const { _id, done } = item;
    const body = {
      ...item,
      done: !done,
    };
    await patchTodoItem(_id, body);
    getData();
  };

  const toggleSortOrder = () => {
    setSortByDate((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const sortData = (todos: TodoItem[]) => {
    return todos.slice().sort((a, b) => {
      if (sortByDate === 'asc') {
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      } else {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });
  };

  function searchTodo(searchKeyword:string) {
    const filteredData = data?.filter((item) => {
      const title = item.title ? item.title.toLowerCase() : ''; // title이 undefined일 경우 빈 문자열 반환
      return title.includes(searchKeyword.toLowerCase());
    });
    return filteredData;
  }

  function filterByDoneValue(doneValue: boolean | null) {
    const filteredData = data?.filter((item) => {
      if (doneValue === null) return true; // null 값이면 모든 데이터 반환
      return item.done === doneValue;
    });
    return filteredData;
  }

  const sortedData = sortData(data);
  const searchedData = searchTodo(searchKeyword);
  const filteredByDoneData = filterByDoneValue(filterByDone); // 추가

  return (
    <>
      <InputContainer>
        <Input
          type="text"
          placeholder="검색어를 입력하세요"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
        <Button onClick={toggleSortOrder}>
          {sortByDate === 'asc' ? '오름차순 정렬' : '내림차순 정렬'}
        </Button>
      </InputContainer>
      <TodoList>
        {filteredByDoneData.map((item) => ( // 변경
          <li key={item._id}>
            <div>
              <CheckBox type='checkbox' onChange={() => checkTodoDone(item)} checked={item.done} />
              <TodoTitle onClick={() => showTodoDetail(item._id)}>{item.title}</TodoTitle>
            </div>

            <TodoUpdate idNum={item._id} toggle={toggle[item._id]} getData={getData} />
          </li>
        ))}
        {!data?.length && <TodoGuide>할일을 추가해주세요.</TodoGuide>}
      </TodoList>
      <ButtonContainer>
        <Button onClick={moveToRegist}>등록</Button>
        <Button className='redButton' onClick={deleteAllTodo}>
          전체삭제
        </Button>
        <Button onClick={() => setFilterByDone(true)}>완료</Button> {/* 추가 */}
        <Button onClick={() => setFilterByDone(false)}>미완료</Button> {/* 추가 */}
        <Button onClick={() => setFilterByDone(null)}>전체</Button> {/* 추가 */}
      </ButtonContainer>
    </>
  );
};
const InputContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  // 다른 스타일 속성들...
`;

const Input = styled.input`
  display: flex;
  align-items: center;
  justify-content: space-between;
  // 다른 스타일 속성들...
`;

const TodoList = styled.ul`
  width: 300px;
  list-style: none;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 35px;
  margin: 0 auto 20px;

  li div {
    display: flex;
  }

  & > input {
    display: inline-block;
    margin-right: 10px;
    width: 20px;
  }
`;

const CheckBox = styled.input`
  margin: 3px 10px 3px 4px;
`;

const TodoTitle = styled.h2`
  display: inline-block;
  background-color: #50E0E5;
  width: 260px;
  height: 40px;
  font-size: 16px;
  border-radius: 75px;
  color: black;
  text-align: left;
  justify-content: start;
  margin: 0;
  padding-left: 30px;
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const TodoGuide = styled.span`
  text-align: center;
`;

// BUTTON
const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 60px;
`;

const Button = styled.button`
  border: none;
  border-radius: 20px;
  background-color: #d9d9d9;
  color: #0000;
  padding: 6px 12px;
  flex-shrink: 0;
  cursor: pointer;

  &.redButton {
    margin-left: 10px;
  }

  &:hover {
    background: #79e127;
    color: white;
  }

  &.redButton:hover {
    background-color: #ef5242;
    color: white;
  }
`;