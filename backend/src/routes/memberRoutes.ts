import { Router } from "express";
import * as memberService from "../services/memberService";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const members = await memberService.getAllActiveMembers();
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: "Błąd podczas pobierania członków" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { firstName, lastName, address, cardNumber } = req.body;
    const newMember = await memberService.createNewMember(
      firstName,
      lastName,
      address,
      cardNumber,
    );
    res.status(201).json(newMember);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const memberId = parseInt(req.params.id, 10);

    if (isNaN(memberId)) {
      return res.status(400).json({ message: "Nieprawidłowy ID członka" });
    }

    const { firstName, lastName, address } = req.body;

    const updateData = {
      ...(firstName && { first_name: firstName }),
      ...(lastName && { last_name: lastName }),
      ...(address !== undefined && { address }),
    };

    const updatedMember = await memberService.updateMemberDetails(
      memberId,
      updateData,
    );
    res.json(updatedMember);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.patch("/:id/deactivate", async (req, res) => {
  try {
    const memberId = parseInt(req.params.id, 10);

    if (isNaN(memberId)) {
      return res.status(400).json({ message: "Nieprawidłowy ID członka" });
    }

    await memberService.deactivateMember(memberId);
    res.json({ message: "Członek został zdezaktywowany" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
