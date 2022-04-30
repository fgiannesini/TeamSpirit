import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

public class TeamTest {

    @Test
    void should_execute_a_task_by_a_team_monomer_with_a_velocity_of_1() {
        TeamMonomer teamMonomer = new TeamMonomer();
        Task task = new Task(1);
        teamMonomer.execute(task);
        Assertions.assertTrue(task.isDone());
    }
}
